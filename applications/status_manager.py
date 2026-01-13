"""
Application Status Manager

Simple utility for managing job application statuses.
Keeps all status logic in one place for easy frontend integration.
"""

# All available statuses
STATUS_SAVED = 'saved'
STATUS_APPLIED = 'applied'
STATUS_INTERVIEW = 'interview'
STATUS_OFFER = 'offer'
STATUS_REJECTED = 'rejected'

# Status display names
STATUS_DISPLAY = {
    STATUS_SAVED: 'Saved',
    STATUS_APPLIED: 'Applied',
    STATUS_INTERVIEW: 'Interview',
    STATUS_OFFER: 'Offer',
    STATUS_REJECTED: 'Rejected',
}

# Statuses that count towards response metrics (exclude 'saved')
COUNTED_STATUSES = [STATUS_APPLIED, STATUS_INTERVIEW, STATUS_OFFER, STATUS_REJECTED]

# Statuses that indicate a response from company (exclude 'saved' and 'applied')
RESPONSE_STATUSES = [STATUS_INTERVIEW, STATUS_OFFER, STATUS_REJECTED]

# All available statuses for dropdowns
ALL_STATUSES = [
    (STATUS_SAVED, STATUS_DISPLAY[STATUS_SAVED]),
    (STATUS_APPLIED, STATUS_DISPLAY[STATUS_APPLIED]),
    (STATUS_INTERVIEW, STATUS_DISPLAY[STATUS_INTERVIEW]),
    (STATUS_OFFER, STATUS_DISPLAY[STATUS_OFFER]),
    (STATUS_REJECTED, STATUS_DISPLAY[STATUS_REJECTED]),
]


def get_status_choices():
    """
    Returns all available status choices.
    Use this in your frontend dropdown.
    
    Returns:
        list: [('saved', 'Saved'), ('applied', 'Applied'), ...]
    """
    return ALL_STATUSES


def get_status_display(status):
    """
    Get friendly display name for a status.
    
    Args:
        status (str): Status key (e.g., 'saved', 'applied')
    
    Returns:
        str: Display name (e.g., 'Saved', 'Applied')
    """
    return STATUS_DISPLAY.get(status, status)


def is_counted_status(status):
    """
    Check if status counts towards response metrics.
    'saved' is excluded - saved jobs don't count.
    
    Args:
        status (str): Status to check
    
    Returns:
        bool: True if status counts in analytics
    """
    return status in COUNTED_STATUSES


def is_response_status(status):
    """
    Check if status indicates a response from company.
    Only 'interview', 'offer', 'rejected' are responses.
    
    Args:
        status (str): Status to check
    
    Returns:
        bool: True if company responded
    """
    return status in RESPONSE_STATUSES


def validate_status(status):
    """
    Validate that status is one of the 5 allowed statuses.
    
    Args:
        status (str): Status to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    valid_statuses = [s[0] for s in ALL_STATUSES]
    
    if status not in valid_statuses:
        return False, f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
    
    return True, None
