# Siman Ban Dashboard Helm Chart

This Helm chart deploys the Siman Ban Management Dashboard, a Persian/Farsi business management system for cement company operations, to Kubernetes clusters.

## Description

The Siman Ban Dashboard is a Next.js-based web application that provides comprehensive management capabilities for:
- Customer management (مدیریت مشتری‌ها)
- Order processing (پردازش سفارش‌ها)
- Invoice management (مدیریت فاکتورها)
- Financial operations (عملیات مالی)

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- Gateway API CRDs installed (for ingress functionality)
- Supabase backend configured

## Installation

### Quick Start

```bash
# Add the chart repository (if using a chart repository)
helm repo add simanban https://charts.simanban.com
helm repo update

# Install the chart with default values
helm install simanban-dashboard simanban/simanban-dashboard

# Or install from local chart
helm install simanban-dashboard ./charts/simanban-dashboard
```

### Custom Installation

```bash
# Install with custom values file
helm install simanban-dashboard ./charts/simanban-dashboard -f values-prod.yaml

# Install in specific namespace
helm install simanban-dashboard ./charts/simanban-dashboard --namespace simanban --create-namespace
```

## Configuration

The following table lists the configurable parameters and their default values:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | Container image repository | `registry.home-lab.ir/simanban/admin-front` |
| `image.tag` | Container image tag | `latest` |
| `deployment.replicaCount` | Number of replicas | `2` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `gateway.enabled` | Enable Gateway API ingress | `true` |
| `gateway.host` | Hostname for external access | `dashboard.simanban.local` |

See `values.yaml` for the complete list of configurable parameters.

## Environment-Specific Deployments

### Development
```bash
helm install simanban-dashboard ./charts/simanban-dashboard -f values-dev.yaml
```

### Staging
```bash
helm install simanban-dashboard ./charts/simanban-dashboard -f values-staging.yaml
```

### Production
```bash
helm install simanban-dashboard ./charts/simanban-dashboard -f values-prod.yaml
```

## Upgrading

```bash
# Upgrade to a new version
helm upgrade simanban-dashboard ./charts/simanban-dashboard

# Upgrade with new values
helm upgrade simanban-dashboard ./charts/simanban-dashboard -f new-values.yaml
```

## Uninstalling

```bash
helm uninstall simanban-dashboard
```

## Architecture

The chart deploys the following Kubernetes resources:
- **Deployment**: Manages the Next.js application pods
- **Service**: Provides internal cluster access
- **Gateway**: Configures external ingress (Gateway API)
- **HTTPRoute**: Defines traffic routing rules
- **ConfigMap**: Stores non-sensitive configuration
- **Secret**: Stores sensitive configuration (Supabase credentials)
- **ServiceAccount**: Provides pod identity and RBAC

## Features

- **Persian/RTL Support**: Full right-to-left layout and Persian text support
- **Scalable Deployment**: Configurable replica count and resource limits
- **Modern Ingress**: Gateway API for advanced traffic management
- **Security**: Non-root containers, security contexts, and RBAC
- **Multi-Environment**: Separate value files for dev/staging/production
- **Health Checks**: Liveness and readiness probes
- **Monitoring**: Proper labels and annotations for observability

## Troubleshooting

### Common Issues

1. **Pod not starting**: Check image pull secrets and repository access
2. **Service not accessible**: Verify service selectors and port configuration
3. **Gateway not working**: Ensure Gateway API CRDs are installed
4. **Database connection**: Verify Supabase configuration in secrets

### Debugging Commands

```bash
# Check pod status
kubectl get pods -l app.kubernetes.io/name=simanban-dashboard

# View pod logs
kubectl logs -l app.kubernetes.io/name=simanban-dashboard

# Check service endpoints
kubectl get endpoints simanban-dashboard

# Describe gateway status
kubectl describe gateway simanban-gateway
```

## Support

For support and documentation:
- GitHub Issues: https://github.com/simanban/management-system/issues
- Documentation: https://docs.simanban.com

## License

This chart is licensed under the MIT License.