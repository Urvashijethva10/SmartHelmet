import logging
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
from bson import ObjectId
from pymongo import MongoClient, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.connected: bool = False
        self._memory_storage: List[Dict[str, Any]] = []  # Fallback storage if MongoDB Atlas is offline

    def connect(self):
        """Establish connection to MongoDB Atlas."""
        if not settings.MONGODB_URI:
            logger.warning("MONGODB_URI is not set. Operating in local in-memory fallback mode.")
            self.connected = False
            return

        try:
            logger.info("Connecting to MongoDB Atlas...")
            self.client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=4000,
                connectTimeoutMS=4000,
                socketTimeoutMS=5000,
                maxPoolSize=20,
            )
            # Test connection with a ping
            self.client.admin.command("ping")
            self.db = self.client[settings.DATABASE_NAME]
            self.connected = True

            # Ensure indexes on detections collection
            self.db[settings.DETECTIONS_COLLECTION].create_index([("timestamp", DESCENDING)])
            self.db[settings.DETECTIONS_COLLECTION].create_index([("summary.safety_status", 1)])
            logger.info("Successfully connected to MongoDB Atlas database: %s", settings.DATABASE_NAME)
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            logger.warning("MongoDB Atlas connection failed: %s. Using in-memory storage fallback.", str(e))
            self.connected = False
            self.client = None
            self.db = None

    def close(self):
        """Close MongoDB connection pool."""
        if self.client:
            self.client.close()
            self.connected = False
            logger.info("MongoDB Atlas connection closed.")

    def check_health(self) -> bool:
        """Check if MongoDB connection is alive."""
        if not self.connected or not self.client:
            return False
        try:
            self.client.admin.command("ping")
            return True
        except Exception:
            self.connected = False
            return False

    def insert_detection(self, detection_doc: Dict[str, Any]) -> str:
        """Insert detection document into MongoDB Atlas or fallback memory."""
        # Ensure timestamp is a datetime object
        if "timestamp" not in detection_doc or not isinstance(detection_doc["timestamp"], datetime):
            detection_doc["timestamp"] = datetime.utcnow()

        if self.connected and self.db is not None:
            try:
                # Do not mutate original
                doc_copy = dict(detection_doc)
                if "_id" in doc_copy and not doc_copy["_id"]:
                    del doc_copy["_id"]
                result = self.db[settings.DETECTIONS_COLLECTION].insert_one(doc_copy)
                return str(result.inserted_id)
            except Exception as e:
                logger.error("Failed to insert into MongoDB: %s. Saving to fallback storage.", str(e))

        # In-memory storage fallback
        doc_id = str(ObjectId())
        doc_with_id = dict(detection_doc)
        doc_with_id["_id"] = doc_id
        self._memory_storage.append(doc_with_id)
        return doc_id

    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Aggregate stats from MongoDB or memory."""
        if self.connected and self.db is not None:
            try:
                col = self.db[settings.DETECTIONS_COLLECTION]
                total_inspections = col.count_documents({})

                if total_inspections == 0:
                    return self._empty_stats()

                # Aggregation pipeline
                pipeline = [
                    {
                        "$group": {
                            "_id": None,
                            "total_workers": {"$sum": "$summary.worker_count"},
                            "total_helmets": {"$sum": "$summary.helmet_count"},
                            "total_no_helmets": {"$sum": "$summary.no_helmet_count"},
                            "total_vests": {"$sum": "$summary.vest_count"},
                            "total_no_vests": {"$sum": "$summary.no_vest_count"},
                            "total_violations": {"$sum": "$summary.total_violations"},
                        }
                    }
                ]
                agg = list(col.aggregate(pipeline))

                # Status breakdown
                status_pipeline = [
                    {"$group": {"_id": "$summary.safety_status", "count": {"$sum": 1}}}
                ]
                status_agg = list(col.aggregate(status_pipeline))
                status_breakdown = {"COMPLIANT": 0, "VIOLATION": 0, "WARNING": 0, "NO_WORKERS": 0}
                for s in status_agg:
                    if s["_id"] in status_breakdown:
                        status_breakdown[s["_id"]] = s["count"]

                # Recent detections
                recent_cursor = col.find().sort("timestamp", DESCENDING).limit(10)
                recent = []
                for doc in recent_cursor:
                    doc["id"] = str(doc.get("_id", ""))
                    doc.pop("_id", None)
                    recent.append(doc)

                if agg:
                    data = agg[0]
                    t_helmets = data.get("total_helmets", 0)
                    t_no_helmets = data.get("total_no_helmets", 0)
                    t_vests = data.get("total_vests", 0)
                    t_no_vests = data.get("total_no_vests", 0)

                    helmet_denom = t_helmets + t_no_helmets
                    vest_denom = t_vests + t_no_vests
                    total_ppe_denom = helmet_denom + vest_denom

                    helmet_compliance = round((t_helmets / helmet_denom * 100.0), 1) if helmet_denom > 0 else (0.0 if t_no_helmets > 0 else 100.0)
                    vest_compliance = round((t_vests / vest_denom * 100.0), 1) if vest_denom > 0 else (0.0 if t_no_vests > 0 else 100.0)
                    overall_compliance = round(((t_helmets + t_vests) / total_ppe_denom * 100.0), 1) if total_ppe_denom > 0 else (0.0 if data.get("total_violations", 0) > 0 else 100.0)

                    return {
                        "total_inspections": total_inspections,
                        "total_workers": data.get("total_workers", 0),
                        "total_violations": data.get("total_violations", 0),
                        "helmet_compliance_rate": helmet_compliance,
                        "vest_compliance_rate": vest_compliance,
                        "overall_compliance_rate": overall_compliance,
                        "class_counts": {
                            "Helmet": t_helmets,
                            "No-Helmet": t_no_helmets,
                            "No-Vest": t_no_vests,
                            "Person": data.get("total_workers", 0),
                            "Vest": t_vests,
                        },
                        "status_breakdown": status_breakdown,
                        "recent_detections": recent,
                    }
            except Exception as e:
                logger.error("Error computing MongoDB dashboard stats: %s", str(e))

        # In-memory stats fallback
        return self._calc_memory_stats()

    def get_history(self, page: int = 1, limit: int = 10, status: Optional[str] = None) -> Tuple[List[Dict[str, Any]], int]:
        """Fetch paginated detection history."""
        skip = (page - 1) * limit

        if self.connected and self.db is not None:
            try:
                col = self.db[settings.DETECTIONS_COLLECTION]
                query = {}
                if status and status.upper() != "ALL":
                    query["summary.safety_status"] = status.upper()

                total = col.count_documents(query)
                cursor = col.find(query).sort("timestamp", DESCENDING).skip(skip).limit(limit)

                items = []
                for doc in cursor:
                    doc["id"] = str(doc.get("_id", ""))
                    doc.pop("_id", None)
                    items.append(doc)

                return items, total
            except Exception as e:
                logger.error("Error retrieving MongoDB history: %s", str(e))

        # Memory storage fallback
        filtered = self._memory_storage
        if status and status.upper() != "ALL":
            filtered = [d for d in self._memory_storage if d.get("summary", {}).get("safety_status") == status.upper()]

        # Sort descending by timestamp
        sorted_items = sorted(filtered, key=lambda x: x.get("timestamp", datetime.min), reverse=True)
        total = len(sorted_items)
        items = sorted_items[skip : skip + limit]
        formatted_items = []
        for d in items:
            item_copy = dict(d)
            item_copy["id"] = str(item_copy.get("_id", item_copy.get("id", "")))
            item_copy.pop("_id", None)
            formatted_items.append(item_copy)

        return formatted_items, total

    def _empty_stats(self) -> Dict[str, Any]:
        return {
            "total_inspections": 0,
            "total_workers": 0,
            "total_violations": 0,
            "helmet_compliance_rate": 100.0,
            "vest_compliance_rate": 100.0,
            "overall_compliance_rate": 100.0,
            "class_counts": {
                "Helmet": 0,
                "No-Helmet": 0,
                "No-Vest": 0,
                "Person": 0,
                "Vest": 0,
            },
            "status_breakdown": {
                "COMPLIANT": 0,
                "VIOLATION": 0,
                "WARNING": 0,
                "NO_WORKERS": 0,
            },
            "recent_detections": [],
        }

    def _calc_memory_stats(self) -> Dict[str, Any]:
        if not self._memory_storage:
            return self._empty_stats()

        total_inspections = len(self._memory_storage)
        t_workers = sum(d.get("summary", {}).get("worker_count", 0) for d in self._memory_storage)
        t_helmets = sum(d.get("summary", {}).get("helmet_count", 0) for d in self._memory_storage)
        t_no_helmets = sum(d.get("summary", {}).get("no_helmet_count", 0) for d in self._memory_storage)
        t_vests = sum(d.get("summary", {}).get("vest_count", 0) for d in self._memory_storage)
        t_no_vests = sum(d.get("summary", {}).get("no_vest_count", 0) for d in self._memory_storage)
        t_violations = sum(d.get("summary", {}).get("total_violations", 0) for d in self._memory_storage)

        status_breakdown = {"COMPLIANT": 0, "VIOLATION": 0, "WARNING": 0, "NO_WORKERS": 0}
        for d in self._memory_storage:
            st = d.get("summary", {}).get("safety_status", "COMPLIANT")
            if st in status_breakdown:
                status_breakdown[st] += 1

        helmet_denom = t_helmets + t_no_helmets
        vest_denom = t_vests + t_no_vests
        total_ppe_denom = helmet_denom + vest_denom

        helmet_compliance = round((t_helmets / helmet_denom * 100.0), 1) if helmet_denom > 0 else (0.0 if t_no_helmets > 0 else 100.0)
        vest_compliance = round((t_vests / vest_denom * 100.0), 1) if vest_denom > 0 else (0.0 if t_no_vests > 0 else 100.0)
        overall_compliance = round(((t_helmets + t_vests) / total_ppe_denom * 100.0), 1) if total_ppe_denom > 0 else (0.0 if t_violations > 0 else 100.0)

        sorted_recent = sorted(self._memory_storage, key=lambda x: x.get("timestamp", datetime.min), reverse=True)[:10]
        recent = []
        for doc in sorted_recent:
            c = dict(doc)
            c["id"] = str(c.get("_id", c.get("id", "")))
            c.pop("_id", None)
            recent.append(c)

        return {
            "total_inspections": total_inspections,
            "total_workers": t_workers,
            "total_violations": t_violations,
            "helmet_compliance_rate": helmet_compliance,
            "vest_compliance_rate": vest_compliance,
            "overall_compliance_rate": overall_compliance,
            "class_counts": {
                "Helmet": t_helmets,
                "No-Helmet": t_no_helmets,
                "No-Vest": t_no_vests,
                "Person": t_workers,
                "Vest": t_vests,
            },
            "status_breakdown": status_breakdown,
            "recent_detections": recent,
        }


db_manager = DatabaseManager()
