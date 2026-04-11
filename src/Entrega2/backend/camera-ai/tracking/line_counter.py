import time

from config import CLASS_TO_CATEGORY, SUB_ITEM_DEFAULT


class VirtualLineCounter:

    def __init__(self, line_position_frac=0.6):
        self.line_position_frac = line_position_frac
        self.line_y = None
        self.counted_ids = set()
        self.counts = {"arroz": 0, "feijao": 0, "outros": 0, "total": 0}
        self.sub_item_counts: dict[str, int] = {}
        self.detections = []

    def update(self, tracked_objects, frame_height):
        if self.line_y is None:
            self.line_y = int(frame_height * self.line_position_frac)

        newly_counted = []
        for obj in tracked_objects:
            obj_id = obj["id"]
            if obj_id in self.counted_ids:
                continue

            cy = obj["centroid"][1]
            if cy >= self.line_y:
                self.counted_ids.add(obj_id)

                raw_label = obj.get("raw_label", obj["label"])
                category, sub_item = CLASS_TO_CATEGORY.get(
                    raw_label, ("outros", SUB_ITEM_DEFAULT)
                )

                self.counts[category] += 1
                self.counts["total"] += 1

                if sub_item != category:
                    self.sub_item_counts[sub_item] = (
                        self.sub_item_counts.get(sub_item, 0) + 1
                    )

                record = {
                    "label": category,
                    "sub_item": sub_item,
                    "confidence": obj["confidence"],
                    "timestamp": time.time(),
                    "object_id": obj_id,
                }
                self.detections.append(record)
                newly_counted.append(record)

        return newly_counted

    def get_line_y(self):
        return self.line_y

    def reset(self):
        self.line_y = None
        self.counted_ids.clear()
        self.counts = {"arroz": 0, "feijao": 0, "outros": 0, "total": 0}
        self.sub_item_counts.clear()
        self.detections.clear()
