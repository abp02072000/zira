package storage

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3config "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/zira-invest/backend/internal/config"
	"github.com/zira-invest/backend/internal/domain/storage"
)

type R2StorageService struct {
	client       *s3.Client
	presignCli   *s3.PresignClient
	bucketName   string
	publicDomain string
}

// NewR2StorageService configure et instancie le client S3 pour Cloudflare R2
func NewR2StorageService(cfg *config.Config) (*R2StorageService, error) {
	r2Endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.R2.AccountID)

	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL:               r2Endpoint,
			SigningRegion:     "auto",
			HostnameImmutable: true,
		}, nil
	})

	awsCfg, err := s3config.LoadDefaultConfig(
		context.Background(),
		s3config.WithEndpointResolverWithOptions(customResolver),
		s3config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.R2.AccessKeyID,
			cfg.R2.AccessKeySecret,
			"",
		)),
		s3config.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("chargement configuration AWS R2: %w", err)
	}

	client := s3.NewFromConfig(awsCfg)
	presignClient := s3.NewPresignClient(client)

	return &R2StorageService{
		client:       client,
		presignCli:   presignClient,
		bucketName:   cfg.R2.BucketName,
		publicDomain: strings.TrimRight(cfg.R2.PublicDomain, "/"),
	}, nil
}

// GeneratePresignedUploadURL génère une URL pré-signée PUT directe
func (s *R2StorageService) GeneratePresignedUploadURL(ctx context.Context, key, mimeType string, maxSizeBytes int64, ttl time.Duration) (*storage.PresignedURLResponse, error) {
	req, err := s.presignCli.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucketName),
		Key:           aws.String(key),
		ContentType:   aws.String(mimeType),
		ContentLength: aws.Int64(maxSizeBytes),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return nil, fmt.Errorf("génération presigned put R2: %w", err)
	}

	headers := make(map[string]string)
	for k, v := range req.SignedHeader {
		if len(v) > 0 {
			headers[k] = v[0]
		}
	}

	return &storage.PresignedURLResponse{
		UploadURL: req.URL,
		Key:       key,
		ExpiresAt: time.Now().UTC().Add(ttl),
		Headers:   headers,
	}, nil
}

// GeneratePresignedDownloadURL génère une URL pré-signée GET temporaire pour les documents confidentiels
func (s *R2StorageService) GeneratePresignedDownloadURL(ctx context.Context, key string, ttl time.Duration) (string, error) {
	req, err := s.presignCli.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", fmt.Errorf("génération presigned get R2: %w", err)
	}
	return req.URL, nil
}

// GetPublicURL génère l'URL publique CDN
func (s *R2StorageService) GetPublicURL(key string) string {
	if s.publicDomain != "" {
		return fmt.Sprintf("%s/%s", s.publicDomain, key)
	}
	return fmt.Sprintf("https://cdn.zira-invest.cd/%s", key)
}

// DeleteObject supprime définitivement un objet du bucket Cloudflare R2
func (s *R2StorageService) DeleteObject(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})
	return err
}

// ObjectExists vérifie si un fichier a bien été téléversé sur R2
func (s *R2StorageService) ObjectExists(ctx context.Context, key string) (bool, error) {
	_, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return false, nil
	}
	return true, nil
}
