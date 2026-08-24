package dto

type PresignedProjectUploadRequest struct {
	FileName string `json:"file_name"`
	MimeType string `json:"mime_type"`
	FileSize int64  `json:"file_size"`
	IsImage  bool   `json:"is_image"`
}

type RegisterDocumentRequest struct {
	Title    string `json:"title"`
	Category string `json:"category"`
	FileName string `json:"file_name"`
	FileSize int64  `json:"file_size"`
	MimeType string `json:"mime_type"`
	R2Key    string `json:"r2_key"`
	IsPublic bool   `json:"is_public"`
}

type AddProjectImageRequest struct {
	Caption   *string `json:"caption"`
	R2Key     string  `json:"r2_key"`
	SortOrder int     `json:"sort_order"`
}
