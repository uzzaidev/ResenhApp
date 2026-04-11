# ResenhApp V2.0 — Permissões e RBAC
> FATO (do código) — src/lib/permissions.ts, src/lib/permissions-middleware.ts

## Hierarquia de Roles

```
Plataforma: super_admin > admin > organizer > player
Grupo:      admin > moderator > member
```

## Roles de Grupo (group_members.role)
| Role | Pode criar eventos | Pode gerenciar membros | Pode cobrar | Pode editar grupo |
|------|-------------------|----------------------|-------------|------------------|
| admin | ✅ | ✅ | ✅ | ✅ |
| moderator | ✅ (parcial) | ✅ (parcial) | ❌ | ❌ |
| member | ❌ | ❌ | ❌ | ❌ |

## GroupPermissions Object
```typescript
{
  canManage: boolean           // Admin do grupo
  canCreateChild: boolean      // Criar grupos filhos (atlética only)
  canEditSettings: boolean     // Editar configurações
  canManageMembers: boolean    // Adicionar/remover membros
  canManageFinances: boolean   // Criar cobranças
  isAdmin: boolean             // É admin deste grupo
  isAthleticAdmin: boolean     // É admin da atlética pai
}
```

## Hierarquia de Grupos
```
Atlética (parent_group_id = NULL, group_type = 'athletic')
  └─ Peladas (parent_group_id = atletica.id, group_type = 'pelada')
     └─ MAX 2 NÍVEIS (sem grupos filhos de peladas)
```

## Funções (src/lib/permissions.ts)
| Função | Retorno | Propósito |
|--------|---------|-----------|
| getGroupHierarchy(groupId) | GroupHierarchy \| null | Grupo + filhos |
| getManagedGroups(userId) | GroupHierarchy[] | Grupos onde é admin |
| canManageGroup(userId, groupId) | boolean | Tem permissão de admin |
| canCreateGroup(userId, parentId?) | {canCreate, reason?} | Pode criar grupo filho |
| getGroupPermissions(userId, groupId) | GroupPermissions | Conjunto completo |
| isAthletic(groupId) | boolean | É grupo pai |
| getParentAthletic(groupId) | string \| null | Retorna ID do pai |
| validateHierarchy(type, parentId?) | {valid, error?} | Valida antes de criar |

## Permissions Middleware (src/lib/permissions-middleware.ts)
```typescript
withPermissionCheck(request, handler, options)
// options:
//   requireAdmin?: boolean   — exige role admin no grupo
//   requireManage?: boolean  — exige canManage=true
//   allowMember?: boolean    — permite membros (default: true)

// Handler recebe: (user, groupId, permissions)
```

## Padrão de Uso nas API Routes
```typescript
export async function POST(request: NextRequest) {
  return withPermissionCheck(
    request,
    async (user, groupId, permissions) => {
      // Código do handler — já validado
      return NextResponse.json({ success: true });
    },
    { requireAdmin: true }
  );
}
```
