import os
from typing import Optional

import boto3
from botocore.exceptions import ClientError


S3_BUCKET = os.environ.get("S3_BUCKET", "")
S3_REGION = os.environ.get("S3_REGION", "us-east-1")
S3_ENABLED = os.environ.get("S3_ENABLED", "false").lower() == "true"


def build_presigned_url(s3_key: Optional[str], expiry_seconds: int = 3600) -> Optional[str]:
    if not s3_key or not S3_ENABLED or not S3_BUCKET:
        return None

    try:
        client = boto3.client("s3", region_name=S3_REGION)
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": s3_key},
            ExpiresIn=expiry_seconds,
        )
        return url
    except ClientError:
        return None
