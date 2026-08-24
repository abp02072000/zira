package member

// Permissions standardisées pour le contrôle d'accès granulaire aux projets
const (
	PermProjectRead            = "project.read"
	PermProjectUpdate          = "project.update"
	PermProjectDelete          = "project.delete"
	PermProjectSubmit          = "project.submit"
	PermProjectManageMembers   = "project.manage_members"
	PermProjectManageDocuments = "project.manage_documents"
)

// DefaultPermissionsForRole retourne la matrice de permissions par défaut selon le rôle
func DefaultPermissionsForRole(r Role) []string {
	switch r {
	case RoleOwner:
		return []string{
			PermProjectRead,
			PermProjectUpdate,
			PermProjectDelete,
			PermProjectSubmit,
			PermProjectManageMembers,
			PermProjectManageDocuments,
		}
	case RoleCofounder:
		return []string{
			PermProjectRead,
			PermProjectUpdate,
			PermProjectSubmit,
			PermProjectManageMembers,
			PermProjectManageDocuments,
		}
	case RoleManager:
		return []string{
			PermProjectRead,
			PermProjectUpdate,
			PermProjectManageDocuments,
		}
	case RoleMember:
		return []string{
			PermProjectRead,
		}
	default:
		return []string{PermProjectRead}
	}
}

// HasPermission vérifie si un membre dispose d'une permission donnée
func (m *ProjectMember) HasPermission(perm string) bool {
	if m.Role == RoleOwner {
		return true // Le propriétaire a tous les droits
	}
	for _, p := range m.Permissions {
		if p == perm {
			return true
		}
	}
	return false
}
