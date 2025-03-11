
# Database Schema Organization

This directory contains the database schema for the Les Stagiaires platform, organized by functional areas.

## Structure

The schema is divided into multiple files to improve maintainability:

- `00_extensions.sql`: Database extensions and common utilities
- `01_users.sql`: User-related tables (settings, login history, etc.)
- `02_stagiaires.sql`: Intern-specific tables (skills, certifications, experiences)
- `03_stages.sql`: Internship offer-related tables (tags, recommendations)
- `04_content.sql`: Content-related tables (articles, comments, events)
- `05_interaction.sql`: User interaction tables (reports, favorites, contact)
- `06_media.sql`: Media and upload-related tables
- `99_finalize.sql`: Final operations to complete schema installation

## Installation

To install the complete schema, run the master schema file:

```bash
psql -f schema.sql
```

Or use the installation script:

```bash
./install_schema.sh
```

## Dependencies

The schema files must be run in the correct order as defined in `schema.sql` to ensure proper dependency resolution.

