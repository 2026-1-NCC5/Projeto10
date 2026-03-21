import time


class VirtualLineCounter:
    """Conta objetos que cruzam uma linha virtual horizontal.

    A linha e posicionada como uma fracao da altura do frame. Quando o centroid
    de um objeto rastreado cruza abaixo da linha, ele e contado exatamente uma vez.
    """

    def __init__(self, line_position_frac=0.6):
        self.line_position_frac = line_position_frac
        self.line_y = None
        self.counted_ids = set()
        self.counts = {"arroz": 0, "feijao": 0, "outros": 0, "total": 0}
        self.detections = []

    def update(self, tracked_objects, frame_height):
        """Verifica se algum objeto cruzou a linha virtual.

        Args:
            tracked_objects: lista de dicts com 'id', 'centroid', 'label', 'confidence'.
            frame_height: altura do frame em pixels.

        Returns:
            Lista de itens contados neste frame (pode ser vazia).
        """
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

                label = obj["label"]
                if label in self.counts:
                    self.counts[label] += 1
                else:
                    self.counts["outros"] += 1
                self.counts["total"] += 1

                record = {
                    "label": label,
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
        self.detections.clear()
