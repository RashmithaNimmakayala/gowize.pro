# Remindly — AWS infrastructure (Terraform)

Provisions everything the backend needs:

- **S3 bucket** for uploaded scan images (private, encrypted, versioned, auto-expiring, CORS for presigned uploads)
- **IAM user + least-privilege policy** scoped to that bucket and Amazon Textract

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.6
- AWS credentials configured (`aws configure`) for a user allowed to create S3 + IAM resources

## Usage

```sh
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # then edit bucket_name (must be globally unique)

terraform init
terraform plan
terraform apply
```

## Get the backend's credentials

The apply creates a dedicated IAM user for the backend. Read its keys (marked sensitive):

```sh
terraform output -raw backend_access_key_id
terraform output -raw backend_secret_access_key
terraform output -raw bucket_name
```

Put those into `backend/.env` (gitignored) or your run configuration.

## ⚠️ Security notes

- `terraform.tfstate` contains the generated secret access key in plaintext. It is **gitignored** — never commit it. For team use, switch to a remote backend (S3 + DynamoDB lock) with encryption.
- For production, prefer an **IAM role** (e.g. on ECS/EC2/Lambda) over a static access key so there is no long-lived secret at all.

## Tear down

```sh
terraform destroy
```
