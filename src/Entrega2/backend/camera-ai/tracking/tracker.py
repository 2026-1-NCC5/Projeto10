import math
from collections import OrderedDict

from config import MAX_DISAPPEARED_FRAMES


class CentroidTracker:

    def __init__(self, max_disappeared=None, max_distance=100.0):
        self.next_object_id = 0
        self.objects = OrderedDict()
        self.labels = OrderedDict()
        self.raw_labels = OrderedDict()
        self.confidences = OrderedDict()
        self.disappeared = OrderedDict()
        self.max_disappeared = max_disappeared or MAX_DISAPPEARED_FRAMES
        self.max_distance = max_distance

    def _register(self, centroid, label, confidence, raw_label=""):
        object_id = self.next_object_id
        self.objects[object_id] = centroid
        self.labels[object_id] = label
        self.raw_labels[object_id] = raw_label or label
        self.confidences[object_id] = confidence
        self.disappeared[object_id] = 0
        self.next_object_id += 1
        return object_id

    def _deregister(self, object_id):
        del self.objects[object_id]
        del self.labels[object_id]
        del self.raw_labels[object_id]
        del self.confidences[object_id]
        del self.disappeared[object_id]

    def update(self, detections):
        if len(detections) == 0:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self._deregister(object_id)
            return self._build_tracked_list()

        if len(self.objects) == 0:
            for det in detections:
                self._register(
                    det["centroid"],
                    det["label"],
                    det["confidence"],
                    det.get("raw_label", det["label"]),
                )
            return self._build_tracked_list()

        object_ids = list(self.objects.keys())
        object_centroids = list(self.objects.values())

        det_centroids = [d["centroid"] for d in detections]

        distances = []
        for oc in object_centroids:
            row = []
            for dc in det_centroids:
                dist = math.hypot(oc[0] - dc[0], oc[1] - dc[1])
                row.append(dist)
            distances.append(row)

        used_rows = set()
        used_cols = set()
        matches = []

        flat = []
        for r in range(len(distances)):
            for c in range(len(distances[r])):
                flat.append((distances[r][c], r, c))
        flat.sort(key=lambda x: x[0])

        for dist, r, c in flat:
            if r in used_rows or c in used_cols:
                continue
            if dist > self.max_distance:
                break
            matches.append((r, c))
            used_rows.add(r)
            used_cols.add(c)

        for r, c in matches:
            oid = object_ids[r]
            self.objects[oid] = det_centroids[c]
            self.labels[oid] = detections[c]["label"]
            self.raw_labels[oid] = detections[c].get("raw_label", detections[c]["label"])
            self.confidences[oid] = detections[c]["confidence"]
            self.disappeared[oid] = 0

        for r in range(len(object_ids)):
            if r not in used_rows:
                oid = object_ids[r]
                self.disappeared[oid] += 1
                if self.disappeared[oid] > self.max_disappeared:
                    self._deregister(oid)

        for c in range(len(detections)):
            if c not in used_cols:
                self._register(
                    detections[c]["centroid"],
                    detections[c]["label"],
                    detections[c]["confidence"],
                    detections[c].get("raw_label", detections[c]["label"]),
                )

        return self._build_tracked_list()

    def _build_tracked_list(self):
        result = []
        for oid in self.objects:
            result.append({
                "id": oid,
                "centroid": self.objects[oid],
                "label": self.labels[oid],
                "raw_label": self.raw_labels[oid],
                "confidence": self.confidences[oid],
            })
        return result

    def reset(self):
        self.next_object_id = 0
        self.objects.clear()
        self.labels.clear()
        self.raw_labels.clear()
        self.confidences.clear()
        self.disappeared.clear()
