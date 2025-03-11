
#!/bin/bash
# Schema installation script
# Run this script to install the complete database schema

echo "Installing database schema..."

# Create the schema directory if it doesn't exist
mkdir -p schema

# Make sure all SQL files have the correct permissions
chmod 644 schema/*.sql

# Connect to the database and run all the scripts
echo "Running schema.sql..."
psql -f schema.sql

echo "Schema installation complete!"

