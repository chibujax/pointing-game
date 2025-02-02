import os
import shutil
from pathlib import Path

def copy_files_with_exclusions(exclude_list=None):
    """
    Copy files from the current directory to a 'copied' directory,
    transforming the path structure into filenames with underscores.
    
    Args:
        exclude_list (list): List of patterns to exclude from copying
    """
    if exclude_list is None:
        exclude_list = []

    # Create the destination directory if it doesn't exist
    dest_dir = Path('copied')
    dest_dir.mkdir(exist_ok=True)
    
    # Get the absolute path of the current directory
    root_dir = Path.cwd()
    print(f"\nStarting copy process from: {root_dir}")
    print(f"Destination directory: {dest_dir.absolute()}")
    print(f"Exclusion patterns: {exclude_list}\n")
    
    # Counter for statistics
    stats = {
        'files_found': 0,
        'files_copied': 0,
        'files_skipped': 0
    }
    
    def should_exclude(path):
        """Check if the path should be excluded based on the exclude list."""
        path_str = str(path)
        for pattern in exclude_list:
            if pattern in path_str:
                print(f"Skipping excluded path: {path_str}")
                return True
        return False
    
    def process_directory(directory):
        """Recursively process directories and copy files."""
        print(f"Scanning directory: {directory}")
        
        try:
            items = list(directory.iterdir())
            print(f"Found {len(items)} items in {directory}")
            
            for item in items:
                # Skip if item matches exclusion patterns
                if should_exclude(item):
                    stats['files_skipped'] += 1
                    continue
                    
                if item.is_file():
                    stats['files_found'] += 1
                    # Get the relative path from root
                    relative_path = item.relative_to(root_dir)
                    
                    # Create new filename by replacing path separators with underscores
                    new_filename = str(relative_path).replace(os.sep, '_')
                    
                    # Create the destination path
                    dest_path = dest_dir / new_filename
                    
                    # Copy the file
                    try:
                        shutil.copy2(item, dest_path)
                        stats['files_copied'] += 1
                        print(f"Copied: {relative_path} -> {new_filename}")
                    except Exception as e:
                        print(f"Error copying {item}: {e}")
                    
                elif item.is_dir() and item != dest_dir:
                    # Recursively process subdirectories
                    process_directory(item)
        except Exception as e:
            print(f"Error processing directory {directory}: {e}")

    # Start processing from the root directory
    process_directory(root_dir)
    
    # Print final statistics
    print("\nCopy Process Complete!")
    print(f"Files found: {stats['files_found']}")
    print(f"Files copied: {stats['files_copied']}")
    print(f"Files skipped: {stats['files_skipped']}")
    print(f"\nFiles are copied to: {dest_dir.absolute()}")

if __name__ == "__main__":
    # Example exclude list - modify as needed
    exclude_patterns = [
        'node_modules',
        '.git',
        '__pycache__',
        '.vscode',
        '.idea',
        '.gitignore',
        'package-lock.json',
        'launch.json',
        'copied',
        '.DS_Store',
        'mediacity.jpg',
        'custom.css'
    ]
    
    try:
        copy_files_with_exclusions(exclude_patterns)
    except Exception as e:
        print(f"\nAn error occurred: {e}")