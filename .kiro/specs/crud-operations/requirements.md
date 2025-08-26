# Requirements Document

## Introduction

This feature implements comprehensive CRUD (Create, Read, Update, Delete) operations for all business entities in the Siman Ban dashboard. Building upon the existing AddClient pattern, this feature will add View, Edit, and Delete functionalities across all entities (Clients, Pre-orders, Orders, Pre-invoices, Invoices) with consistent modal-based interfaces, job integration, and Persian/RTL support.

## Requirements

### Requirement 1

**User Story:** As a dashboard user, I want to view detailed information of any entity record, so that I can review complete data without editing.

#### Acceptance Criteria

1. WHEN I click the view icon (EyeIcon) in any table row THEN the system SHALL display a modal with complete entity details
2. WHEN the view modal opens THEN the system SHALL show all entity fields in a read-only format with Persian labels
3. WHEN viewing an entity THEN the system SHALL display associated jobs and their current statuses
4. WHEN the view modal is open THEN the system SHALL provide a close button to dismiss the modal
5. IF the entity has related records THEN the system SHALL display basic information about related entities

### Requirement 2

**User Story:** As a dashboard user, I want to edit existing entity records, so that I can update information when changes are needed.

#### Acceptance Criteria

1. WHEN I click the edit icon (EditIcon) in any table row THEN the system SHALL display a modal with editable form fields
2. WHEN the edit modal opens THEN the system SHALL pre-populate all form fields with current entity data
3. WHEN I submit valid changes THEN the system SHALL update the entity and trigger associated jobs
4. WHEN I submit the edit form THEN the system SHALL display success/error messages in Persian
5. WHEN edit is successful THEN the system SHALL refresh the table data and show updated information
6. WHEN I cancel editing THEN the system SHALL close the modal without saving changes
7. IF the entity has status-dependent fields THEN the system SHALL validate business rules before saving

### Requirement 3

**User Story:** As a dashboard user, I want to delete entity records, so that I can remove outdated or incorrect information.

#### Acceptance Criteria

1. WHEN I click the delete icon (DeleteIcon) in any table row THEN the system SHALL display a confirmation modal
2. WHEN the delete confirmation modal opens THEN the system SHALL show entity details and ask for confirmation in Persian
3. WHEN I confirm deletion THEN the system SHALL permanently remove the entity and trigger cleanup jobs
4. WHEN deletion is successful THEN the system SHALL refresh the table and show success message
5. WHEN I cancel deletion THEN the system SHALL close the confirmation modal without deleting
6. IF the entity has dependent records THEN the system SHALL prevent deletion and show appropriate error message
7. WHEN deletion fails THEN the system SHALL display error message and keep the record intact

### Requirement 4

**User Story:** As a dashboard user, I want consistent job integration across all CRUD operations, so that I can track workflow progress for any entity action.

#### Acceptance Criteria

1. WHEN any CRUD operation completes successfully THEN the system SHALL trigger appropriate jobs based on entity type and operation
2. WHEN jobs are triggered THEN the system SHALL display job cards with real-time status updates
3. WHEN viewing jobs THEN the system SHALL show Persian job names and status indicators with appropriate colors
4. WHEN jobs are running THEN the system SHALL expand modal size to accommodate job display area
5. IF no jobs are triggered THEN the system SHALL maintain standard modal size

### Requirement 5

**User Story:** As a dashboard user, I want all CRUD modals to follow consistent design patterns, so that I have a familiar and efficient user experience.

#### Acceptance Criteria

1. WHEN any CRUD modal opens THEN the system SHALL use consistent modal sizing, positioning, and styling
2. WHEN displaying form fields THEN the system SHALL use Persian labels and RTL layout
3. WHEN showing action buttons THEN the system SHALL use consistent Persian text and color coding
4. WHEN displaying entity data THEN the system SHALL format dates, numbers, and text according to Persian standards
5. WHEN showing status information THEN the system SHALL use consistent chip colors and Persian status names
6. WHEN modals are draggable THEN the system SHALL maintain draggable functionality across all CRUD operations

### Requirement 6

**User Story:** As a dashboard user, I want entity-specific validation and business rules, so that data integrity is maintained across all operations.

#### Acceptance Criteria

1. WHEN editing client information THEN the system SHALL validate required fields (name, phone, SSN, address)
2. WHEN editing orders THEN the system SHALL prevent changes if order is already invoiced
3. WHEN deleting pre-orders THEN the system SHALL check if they are converted to orders
4. WHEN editing financial amounts THEN the system SHALL validate decimal precision and positive values
5. WHEN updating status fields THEN the system SHALL enforce valid status transitions
6. IF validation fails THEN the system SHALL display specific error messages in Persian