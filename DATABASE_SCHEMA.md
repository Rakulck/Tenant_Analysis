# Tenant Default Analysis Platform - Database Schema

## Overview

This database schema is designed for a standalone tenant default analysis platform built with Supabase (PostgreSQL). The platform uses AI-powered analysis to predict tenant default risk and provide actionable insights for property managers.

## Migration Files

The database schema is organized into 5 migration files:

1. **`20250101000001_create_enums_and_types.sql`** - Custom types and enums
2. **`20250101000002_create_core_tables.sql`** - Core business tables
3. **`20250101000003_create_analysis_tables.sql`** - Analysis and file management
4. **`20250101000004_create_rls_policies.sql`** - Row Level Security policies
5. **`20250101000005_create_storage_buckets.sql`** - File storage configuration

## Core Entities and Relationships

### Entity Relationship Overview

```
auth.users (Supabase Auth)
    ↓
user_profiles (1:1)
    ↓
properties (1:many)
    ↓
tenants (1:many)
    ↓
analysis_requests (many:1)
    ↓
├── uploaded_files (1:many)
├── risk_assessments (1:many)
├── analysis_summaries (1:1)
└── recommended_actions (1:many via risk_assessments)
```

## Detailed Table Specifications

### Core Business Tables

#### 1. `user_profiles`

**Purpose**: Extended user information beyond Supabase auth

| Column                       | Type    | Description                             |
| ---------------------------- | ------- | --------------------------------------- |
| `id`                       | uuid    | Primary key, references auth.users(id)  |
| `email`                    | text    | User email address                      |
| `full_name`                | text    | User's full name                        |
| `company_name`             | text    | Company or organization name            |
| `subscription_plan`        | text    | Plan: starter, professional, enterprise |
| `analysis_quota`           | integer | Monthly analysis limit                  |
| `analyses_used_this_month` | integer | Current month usage                     |
| `notification_preferences` | jsonb   | Email and alert preferences             |
| `dashboard_preferences`    | jsonb   | UI customization settings               |

**Key Features**:

- Subscription management with usage tracking
- Automatic monthly quota reset
- Flexible preference storage

#### 2. `properties`

**Purpose**: Property information and management details

| Column                    | Type          | Description                         |
| ------------------------- | ------------- | ----------------------------------- |
| `id`                    | uuid          | Primary key                         |
| `user_id`               | uuid          | Foreign key to user_profiles        |
| `name`                  | text          | Property name/identifier            |
| `property_type`         | property_type | Type enum (apartment_complex, etc.) |
| `address`               | address       | Structured address with coordinates |
| `total_units`           | integer       | Number of rental units              |
| `acquisition_price`     | numeric(15,2) | Purchase price                      |
| `property_manager_name` | text          | Manager contact information         |

**Key Features**:

- Structured address storage with geocoding support
- Property financial tracking
- Management contact information

#### 3. `tenants`

**Purpose**: Individual tenant records and lease information

| Column                 | Type          | Description                |
| ---------------------- | ------------- | -------------------------- |
| `id`                 | uuid          | Primary key                |
| `property_id`        | uuid          | Foreign key to properties  |
| `tenant_name`        | text          | Tenant's name              |
| `unit_number`        | text          | Unit identifier            |
| `lease_start_date`   | date          | Lease commencement         |
| `lease_end_date`     | date          | Lease expiration           |
| `monthly_rent`       | numeric(10,2) | Current rent amount        |
| `current_balance`    | numeric(10,2) | Outstanding balance        |
| `tenant_status`      | tenant_status | active, notice_given, etc. |
| `current_risk_level` | risk_severity | Latest risk assessment     |

**Key Features**:

- Complete lease lifecycle tracking
- Real-time risk level updates
- Payment history integration

### Analysis and AI Tables

#### 4. `analysis_requests`

**Purpose**: Track all analysis requests and processing status

| Column                     | Type            | Description                            |
| -------------------------- | --------------- | -------------------------------------- |
| `id`                     | uuid            | Primary key                            |
| `user_id`                | uuid            | Foreign key to user_profiles           |
| `property_id`            | uuid            | Foreign key to properties              |
| `status`                 | analysis_status | pending, processing, completed, failed |
| `include_web_search`     | boolean         | Enable economic data search            |
| `search_location`        | jsonb           | Location for economic research         |
| `total_tenants_analyzed` | integer         | Number of tenants processed            |
| `processing_time_ms`     | integer         | Analysis duration                      |

**Key Features**:

- Complete audit trail of analyses
- Processing performance metrics
- Configurable AI parameters

#### 5. `uploaded_files`

**Purpose**: Manage rent roll documents and file storage

| Column                  | Type          | Description                      |
| ----------------------- | ------------- | -------------------------------- |
| `id`                  | uuid          | Primary key                      |
| `analysis_request_id` | uuid          | Foreign key to analysis_requests |
| `original_filename`   | text          | User's filename                  |
| `stored_filename`     | text          | Storage system filename          |
| `file_size_bytes`     | bigint        | File size                        |
| `document_type`       | document_type | rent_roll, lease_agreement, etc. |
| `storage_bucket`      | text          | Supabase storage bucket          |
| `file_status`         | file_status   | uploaded, processing, processed  |

**Key Features**:

- Secure file storage with versioning
- Automatic cleanup policies
- Multiple document type support

#### 6. `risk_assessments`

**Purpose**: Individual tenant risk evaluation results

| Column                   | Type              | Description                      |
| ------------------------ | ----------------- | -------------------------------- |
| `id`                   | uuid              | Primary key                      |
| `analysis_request_id`  | uuid              | Foreign key to analysis_requests |
| `tenant_name`          | text              | Tenant identifier                |
| `unit_number`          | text              | Unit identifier                  |
| `risk_severity`        | risk_severity     | low, medium, high, critical      |
| `default_probability`  | decimal(5,2)      | 0-100% probability               |
| `financial_indicators` | financial_metrics | Payment history, arrears         |
| `risk_factors`         | text[]            | Contributing risk factors        |
| `comments`             | text              | AI analysis explanation          |
| `confidence_level`     | decimal(5,2)      | AI confidence (0-100%)           |

**Key Features**:

- Detailed risk scoring with explanations
- Historical trend tracking
- Structured financial indicators

#### 7. `recommended_actions`

**Purpose**: AI-generated action items for risk management

| Column                 | Type             | Description                     |
| ---------------------- | ---------------- | ------------------------------- |
| `id`                 | uuid             | Primary key                     |
| `risk_assessment_id` | uuid             | Foreign key to risk_assessments |
| `action_type`        | next_action_type | monitor, contact_tenant, etc.   |
| `description`        | text             | Detailed action description     |
| `priority`           | priority_level   | immediate, urgent, normal, low  |
| `timeline`           | text             | Recommended timeframe           |
| `estimated_cost`     | numeric(10,2)    | Cost estimate if applicable     |
| `is_completed`       | boolean          | Action completion status        |

**Key Features**:

- Prioritized action items
- Cost estimation
- Completion tracking

#### 8. `analysis_summaries`

**Purpose**: Property-level analysis overview and metrics

| Column                  | Type          | Description                      |
| ----------------------- | ------------- | -------------------------------- |
| `id`                  | uuid          | Primary key                      |
| `analysis_request_id` | uuid          | Foreign key to analysis_requests |
| `risk_summary`        | risk_summary  | Aggregated risk statistics       |
| `macroeconomic_data`  | macro_context | Economic context data            |
| `data_completeness`   | decimal(5,2)  | Data quality score (0-100%)      |
| `confidence_score`    | decimal(5,2)  | Overall confidence (0-100%)      |

**Key Features**:

- Portfolio-level risk insights
- Economic context integration
- Data quality metrics

### System Tables

#### 9. `notifications`

**Purpose**: User alerts and system messages

| Column                | Type              | Description                         |
| --------------------- | ----------------- | ----------------------------------- |
| `id`                | uuid              | Primary key                         |
| `user_id`           | uuid              | Foreign key to user_profiles        |
| `notification_type` | notification_type | risk_alert, analysis_complete, etc. |
| `title`             | text              | Notification title                  |
| `message`           | text              | Notification content                |
| `is_read`           | boolean           | Read status                         |
| `priority`          | priority_level    | Notification priority               |

## Custom Types and Enums

### Risk Assessment Types

- **`risk_severity`**: low, medium, high, critical
- **`payment_pattern`**: on_time, occasionally_late, frequently_late, consistently_late, in_arrears, no_payment
- **`next_action_type`**: monitor, contact_tenant, payment_plan, formal_notice, legal_consultation, eviction_process, unit_preparation

### Business Types

- **`property_type`**: single_family, duplex, apartment_complex, etc.
- **`tenant_status`**: active, notice_given, vacated, evicted, lease_expired
- **`analysis_status`**: pending, processing, completed, failed, cancelled

### Composite Types

- **`address`**: Structured location data with coordinates
- **`financial_metrics`**: Comprehensive financial indicators
- **`macro_context`**: Economic context data
- **`risk_summary`**: Aggregated risk statistics

## Security Model

### Row Level Security (RLS)

All tables implement comprehensive RLS policies ensuring:

1. **Data Isolation**: Users can only access their own data
2. **Property Ownership**: Tenants and analyses are tied to user-owned properties
3. **Quota Enforcement**: Analysis creation respects subscription limits
4. **Status Protection**: Prevents modification of completed analyses

### Key Security Features

- **User Isolation**: All data is strictly partitioned by user
- **Property Validation**: Cross-property access is prevented
- **Quota Enforcement**: Subscription limits are enforced at database level
- **File Security**: Storage policies ensure secure file access
- **Audit Trail**: Complete tracking of all data modifications

## Storage Buckets

### Configured Buckets

1. **`rent-rolls`** (Private, 25MB limit)

   - PDF, Excel, CSV rent roll documents
   - Organized by user ID folders
2. **`profile-images`** (Public, 2MB limit)

   - User profile photos
   - Standard image formats
3. **`property-documents`** (Private, 10MB limit)

   - Property-related documents
   - Mixed file type support
4. **`reports`** (Private, 50MB limit)

   - Generated analysis reports
   - Export files and summaries

### Storage Security

- User-based folder structure
- Automatic file naming with timestamps
- Comprehensive access policies
- File cleanup and archiving

## Performance Optimizations

### Indexing Strategy

- **User-based queries**: Optimized for user_id lookups
- **Time-based queries**: Indexed on creation and update timestamps
- **Risk analysis**: Optimized for risk level and probability searches
- **Property location**: GIN indexes for address components
- **File management**: Indexed on status and type fields

### Query Optimization

- **Composite indexes** for common query patterns
- **Partial indexes** for conditional queries
- **Function-based indexes** for computed values
- **Foreign key indexes** for join performance

## Maintenance and Monitoring

### Automated Processes

- **Monthly quota reset** via scheduled function
- **File cleanup** for old archived files
- **Usage statistics** calculation
- **Performance monitoring** via indexes

### Health Checks

- **Storage usage** per user and bucket
- **Analysis performance** metrics
- **Error rate** monitoring
- **Data quality** scoring

## Usage Examples

### Common Query Patterns

```sql
-- Get user's properties with risk summaries
SELECT p.name, p.total_units, 
       COUNT(t.id) as total_tenants,
       COUNT(CASE WHEN t.current_risk_level IN ('high', 'critical') THEN 1 END) as high_risk
FROM properties p
LEFT JOIN tenants t ON p.id = t.property_id
WHERE p.user_id = auth.uid()
GROUP BY p.id, p.name, p.total_units;

-- Get recent analysis results
SELECT ar.created_at, p.name, ar.total_tenants_analyzed, ar.status
FROM analysis_requests ar
JOIN properties p ON ar.property_id = p.id
WHERE ar.user_id = auth.uid()
ORDER BY ar.created_at DESC
LIMIT 10;

-- Get high-priority action items
SELECT ra.description, ra.timeline, ra.priority, t.tenant_name
FROM recommended_actions ra
JOIN risk_assessments ras ON ra.risk_assessment_id = ras.id
JOIN tenants t ON ras.tenant_id = t.id
WHERE ra.user_id = auth.uid() 
  AND ra.is_completed = false
  AND ra.priority IN ('immediate', 'urgent')
ORDER BY ra.priority, ra.created_at;
```

## Migration Instructions

1. **Prerequisites**: Supabase project with PostgreSQL 15+
2. **Execution Order**: Run migrations 001-005 in sequence
3. **Permissions**: Ensure service role has necessary grants
4. **Verification**: Check RLS policies and storage bucket creation
5. **Testing**: Verify user registration and basic operations

## Backup and Recovery

### Backup Strategy

- **Daily automated backups** of all tables
- **Point-in-time recovery** for critical data
- **Storage bucket backups** for uploaded files
- **Schema versioning** for migration tracking

### Recovery Procedures

- **User data restoration** from backups
- **File recovery** from storage backups
- **Schema rollback** capabilities
- **Disaster recovery** procedures

This schema provides a robust foundation for the tenant default analysis platform with comprehensive security, performance optimization, and scalability features.
