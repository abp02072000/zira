package common

import "errors"

var (
	// User & Identity errors
	ErrUserNotFound          = errors.New("utilisateur introuvable")
	ErrUserAlreadyExists     = errors.New("un utilisateur avec cet identifiant ou cet email existe déjà")
	ErrInvalidUsername       = errors.New("nom d'utilisateur invalide : 3 à 30 caractères alphanumériques, tirets et underscores uniquement")
	ErrUsernameReserved      = errors.New("ce nom d'utilisateur est réservé par la plateforme")
	ErrUsernameTaken         = errors.New("ce nom d'utilisateur est déjà utilisé")
	ErrClerkIdentityMissing  = errors.New("revendication d'identité Clerk manquante ou invalide")

	// Project errors
	ErrProjectNotFound       = errors.New("projet introuvable")
	ErrInvalidProjectState   = errors.New("transition d'état de projet non autorisée")
	ErrUnauthorizedProjectOp = errors.New("action non autorisée sur ce projet : permissions insuffisantes")
	ErrProjectSlugTaken      = errors.New("ce slug de projet est déjà utilisé")
	ErrInvalidFundingParams  = errors.New("paramètres de financement invalides")

	// Project Member & Permission errors
	ErrMemberNotFound        = errors.New("membre du projet introuvable")
	ErrMemberAlreadyExists   = errors.New("cet utilisateur est déjà membre du projet")
	ErrCannotRemoveOwner     = errors.New("le propriétaire du projet ne peut pas être supprimé")
	ErrInvitationNotFound    = errors.New("invitation introuvable ou expirée")
	ErrInvitationExpired     = errors.New("cette invitation a expiré")
	ErrInvitationNotPending  = errors.New("cette invitation a déjà été traitée")

	// KYC errors
	ErrKycNotFound           = errors.New("dossier KYC introuvable")
	ErrInvalidKycState       = errors.New("transition de statut KYC non valide")
	ErrKycAlreadyApproved    = errors.New("le dossier KYC est déjà approuvé")
	ErrKycDocsRequired       = errors.New("au moins un document officiel d'identification est requis")

	// Storage & R2 errors
	ErrInvalidFileType       = errors.New("type de fichier (MIME) non autorisé")
	ErrFileTooLarge          = errors.New("taille de fichier dépassant la limite autorisée")
	ErrStorageAccessDenied   = errors.New("accès non autorisé à cet objet de stockage")

	// General
	ErrUnauthorized          = errors.New("non authentifié")
	ErrForbidden             = errors.New("accès interdit : privilèges insuffisants")
	ErrInvalidInput          = errors.New("données fournies invalides")
)
