terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "gowize"
      ManagedBy = "terraform"
    }
  }
}

# CloudFront requires its ACM certificate to live in us-east-1, regardless of
# where the rest of the stack runs.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "gowize"
      ManagedBy = "terraform"
    }
  }
}
