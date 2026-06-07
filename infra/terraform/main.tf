locals {
  name = var.project
}

# --------------------------------------------------------------------------
# S3 bucket for uploaded product photos (scans)
# --------------------------------------------------------------------------
resource "aws_s3_bucket" "scans" {
  bucket = var.bucket_name
}

# Block all public access — images are served via presigned URLs only.
resource "aws_s3_bucket_public_access_block" "scans" {
  bucket                  = aws_s3_bucket.scans.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "scans" {
  bucket = aws_s3_bucket.scans.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "scans" {
  bucket = aws_s3_bucket.scans.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Auto-expire raw scans to keep storage costs flat (Textract runs at upload time).
resource "aws_s3_bucket_lifecycle_configuration" "scans" {
  count  = var.scan_expiration_days > 0 ? 1 : 0
  bucket = aws_s3_bucket.scans.id

  rule {
    id     = "expire-raw-scans"
    status = "Enabled"

    filter {
      prefix = "scans/"
    }

    expiration {
      days = var.scan_expiration_days
    }
  }
}

# Allow the PWA to PUT directly to S3 with presigned URLs.
resource "aws_s3_bucket_cors_configuration" "scans" {
  bucket = aws_s3_bucket.scans.id

  cors_rule {
    allowed_methods = ["PUT", "GET"]
    allowed_origins = var.cors_origins
    allowed_headers = ["*"]
    max_age_seconds = 3000
  }
}

# --------------------------------------------------------------------------
# Least-privilege IAM user for the backend (S3 scan bucket + Textract)
# --------------------------------------------------------------------------
data "aws_iam_policy_document" "app" {
  statement {
    sid    = "ScanBucketObjects"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
    ]
    resources = ["${aws_s3_bucket.scans.arn}/*"]
  }

  statement {
    sid       = "ScanBucketList"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.scans.arn]
  }

  statement {
    sid    = "Textract"
    effect = "Allow"
    actions = [
      "textract:DetectDocumentText",
      "textract:AnalyzeDocument",
      "textract:AnalyzeExpense",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_user" "app" {
  name = "${local.name}-backend"
}

resource "aws_iam_user_policy" "app" {
  name   = "${local.name}-backend-policy"
  user   = aws_iam_user.app.name
  policy = data.aws_iam_policy_document.app.json
}

resource "aws_iam_access_key" "app" {
  user = aws_iam_user.app.name
}
