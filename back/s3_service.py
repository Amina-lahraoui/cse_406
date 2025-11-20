import boto3
import base64
from datetime import datetime
import os
from typing import Dict

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client("s3", region_name=os.getenv("AWS_S3_REGION"))
        self.bucket_name = os.getenv("AWS_S3_BUCKET")
        self.region = os.getenv("AWS_S3_REGION")

    def upload_image(self, image_base64: str, user_id: int, source: str) -> Dict[str, str]:
        try:
            if "," in image_base64:
                image_data = base64.b64decode(image_base64.split(",")[1])
            else:
                image_data = base64.b64decode(image_base64)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S%f")[:-3]
            filename = f"photos/{user_id}/{source}_{timestamp}.jpg"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=image_data,
                ContentType="image/jpeg",
                ServerSideEncryption="AES256"
            )
            
            s3_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{filename}"
            
            return { "filename": filename, "s3_url": s3_url }
        
        except Exception as e:
            raise Exception(f"Erreur upload S3: {str(e)}")

s3_service = S3Service()
