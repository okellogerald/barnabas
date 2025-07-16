#!/opt/homebrew/bin/bash

# Church Membership Management System - Sample Data Generator
# Creates fellowships, users, and members using existing roles

set -euo pipefail

# 🛠 Configuration
API_PORT="${API_PORT:-8585}"
API_BASE_URL="http://localhost:${API_PORT}"
AUTH_TOKEN=""
CHURCH_ID=""
DEBUG="${DEBUG:-false}"
ADMIN_USER="${ADMIN_USER:-admin@mychurch.com}"
ADMIN_PASS="${ADMIN_PASS:-guest}"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

# Logging helpers
log()   { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
debug() { [[ "$DEBUG" == "true" ]] && echo -e "${BLUE}[DEBUG]${NC} $1" >&2; }

# Clean up temp files on exit
TMPFILES=()
trap '[[ ${#TMPFILES[@]} -gt 0 ]] && rm -f "${TMPFILES[@]}"' EXIT

# Utility functions
random_date() {
    printf "%04d-%02d-%02d" $(( $1 + RANDOM % ($2 - $1 + 1) )) $((1 + RANDOM % 12)) $((1 + RANDOM % 28))
}

get_random_element() { 
    local arr=("$@")
    echo "${arr[RANDOM % ${#arr[@]}]}"
}

random_phone() { 
    echo "255$((RANDOM % 9 + 1))$(printf "%07d" $((RANDOM % 10000000)))"
}

# Safe array shuffle function
safe_shuffle() {
    local arr=("$@")
    local shuffled=()
    local remaining=("${arr[@]}")
    
    while [ ${#remaining[@]} -gt 0 ]; do
        local idx=$((RANDOM % ${#remaining[@]}))
        shuffled+=("${remaining[$idx]}")
        # Remove element at index
        remaining=("${remaining[@]:0:$idx}" "${remaining[@]:$((idx + 1))}")
    done
    
    printf '%s\n' "${shuffled[@]}"
}

# HTTP helpers with enhanced error handling and debugging
post_json() {
    local url="$1" data="$2" tmp
    tmp=$(mktemp)
    TMPFILES+=("$tmp")
    
    debug "POST $url"
    debug "Request data: $data"
    
    local status
    if ! status=$(curl -s -w "%{http_code}" -o "$tmp" -X POST \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$data" "$url"); then
        error "curl command failed for POST $url"
        return 1
    fi
    
    local response_body
    if ! response_body=$(cat "$tmp"); then
        error "Failed to read response from POST $url"
        return 1
    fi
    
    debug "Response status: $status"
    debug "Response body: $response_body"
    
    if [[ "$status" =~ ^20[01]$ ]]; then
        echo "$response_body"
        return 0
    else
        error "POST $url failed with status $status"
        error "Response: $response_body"
        return 1
    fi
}

patch_json() {
    local url="$1" data="$2" tmp
    tmp=$(mktemp)
    TMPFILES+=("$tmp")
    
    debug "PATCH $url"
    debug "Request data: $data"
    
    local status
    status=$(curl -s -w "%{http_code}" -o "$tmp" -X PATCH \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$data" "$url")
    
    local response_body
    response_body=$(cat "$tmp")
    debug "Response status: $status"
    debug "Response body: $response_body"
    
    if [[ "$status" =~ ^20[01]$ ]]; then
        echo "$response_body"
        return 0
    else
        error "PATCH $url failed with status $status"
        error "Response: $response_body"
        return 1
    fi
}

get_json() {
    local url="$1" tmp
    tmp=$(mktemp)
    TMPFILES+=("$tmp")
    
    debug "GET $url"
    
    local status
    status=$(curl -s -w "%{http_code}" -o "$tmp" -X GET \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        "$url")
    
    local response_body
    response_body=$(cat "$tmp")
    
    debug "Response status: $status"
    debug "Response body length: ${#response_body} characters"
    
    if [[ "$status" =~ ^20[01]$ ]]; then
        echo "$response_body"
        return 0
    else
        error "GET $url failed with status $status"
        error "Response: $response_body"
        return 1
    fi
}

# Safe entity existence check
entity_exists() {
    local existing_data="$1" field="$2" value="$3"
    
    # Check if data is empty or null
    if [[ -z "$existing_data" || "$existing_data" == "null" || "$existing_data" == "[]" ]]; then
        return 1
    fi
    
    # Check if the entity exists
    echo "$existing_data" | jq -e --arg field "$field" --arg value "$value" '.[] | select(.[$field] == $value)' >/dev/null 2>&1
}

# Authentication
initialize() {
    log "Authenticating with $API_BASE_URL..."
    local payload response
    payload=$(jq -n --arg u "$ADMIN_USER" --arg p "$ADMIN_PASS" '{username:$u, password:$p}')
    
    debug "Auth payload: $payload"
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$API_BASE_URL/auth/login")
    
    debug "Auth response: $response"
    
    if echo "$response" | jq -e '.token' >/dev/null 2>&1; then
        AUTH_TOKEN=$(echo "$response" | jq -r '.token')
        CHURCH_ID=$(echo "$response" | jq -r '.user.churchId')
        log "Authenticated successfully — Church ID: $CHURCH_ID"
        debug "Auth token: ${AUTH_TOKEN:0:20}..."
    else
        error "Authentication failed: $response"
        exit 1
    fi
}

# Test API connectivity with a simple endpoint
test_api_endpoints() {
    log "Testing API endpoints..."
    
    # Test role endpoint
    log "Testing /role endpoint..."
    if roles_response=$(get_json "$API_BASE_URL/role"); then
        log "Role endpoint accessible"
        debug "Roles response: $roles_response"
    else
        error "Role endpoint failed"
        return 1
    fi
    
    # Test fellowship endpoint
    log "Testing /fellowship endpoint..."
    if fellowship_response=$(get_json "$API_BASE_URL/fellowship"); then
        log "Fellowship endpoint accessible"
        debug "Fellowship response: $fellowship_response"
    else
        error "Fellowship endpoint failed"
        return 1
    fi
    
    # Test user endpoint
    log "Testing /user endpoint..."
    if user_response=$(get_json "$API_BASE_URL/user"); then
        log "User endpoint accessible"
        debug "User response: $user_response"
    else
        error "User endpoint failed"
        return 1
    fi
    
    # Test member endpoint
    log "Testing /member endpoint..."
    if member_response=$(get_json "$API_BASE_URL/member"); then
        log "Member endpoint accessible"
        debug "Member response: $member_response"
    else
        error "Member endpoint failed"
        return 1
    fi
    
    log "All API endpoints are accessible"
    return 0
}

# Generate fellowships with safe failure
generate_fellowships() {
    log "Generating fellowships..."
    local existing created=0
    
    # Fetch existing fellowships
    log "Fetching existing fellowships..."
    if ! existing=$(get_json "$API_BASE_URL/fellowship"); then
        error "Failed to fetch existing fellowships"
        return 1
    fi
    
    debug "Existing fellowships received"
    
    # Simple validation - just check if we can parse it and get a length
    local fellowship_count
    if fellowship_count=$(echo "$existing" | jq length 2>/dev/null); then
        debug "Successfully parsed JSON, found $fellowship_count fellowship(s)"
    else
        error "Failed to parse fellowships JSON response"
        debug "Raw response: $existing"
        return 1
    fi
    
    if (( fellowship_count == 0 )); then
        log "No existing fellowships found"
    else
        log "Found $fellowship_count existing fellowship(s)"
        if [[ "$DEBUG" == "true" ]]; then
            echo "$existing" | jq -r '.[] | "  - \(.name) (ID: \(.id))"'
        fi
    fi
    
    local fellowship_names=(
        "Bethany" "Tumaini" "Grace" "Faith" "Hope" 
        "Cornerstone" "Emmanuel" "Calvary" "Zion" "Nazareth"
    )
    
    for name in "${fellowship_names[@]}"; do
        if entity_exists "$existing" "name" "$name"; then
            log "Fellowship already exists: $name"
        else
            local data
            data=$(jq -n \
                --arg name "$name" \
                --arg note "$name fellowship group - a community of believers" \
                '{name:$name, notes:$note}')
            
            debug "Creating fellowship: $name with data: $data"
            
            if result=$(post_json "$API_BASE_URL/fellowship" "$data"); then
                log "Created fellowship: $name"
                ((created++))
            else
                warn "Failed to create fellowship: $name"
            fi
        fi
    done
    
    log "Fellowships created: $created"
}

# Generate users using existing roles
generate_users() {
    log "Generating users..."
    local existing roles created=0
    
    # Fetch existing users
    log "Fetching existing users..."
    if ! existing=$(get_json "$API_BASE_URL/user"); then
        error "Failed to fetch existing users"
        return 1
    fi
    
    debug "Existing users: $existing"
    
    # Fetch existing roles
    log "Fetching existing roles..."
    if ! roles=$(get_json "$API_BASE_URL/role"); then
        error "Failed to fetch roles from API"
        return 1
    fi
    
    debug "Roles response received"
    
    # Simple validation - just check if we can parse it and get a length
    local role_count
    if role_count=$(echo "$roles" | jq length 2>/dev/null); then
        debug "Successfully parsed roles JSON, found $role_count role(s)"
    else
        error "Failed to parse roles JSON response"
        debug "Raw response: $roles"
        return 1
    fi
    
    if (( role_count == 0 )); then
        error "No roles found in the system"
        return 1
    fi
    
    log "Found $role_count role(s)"
    if [[ "$DEBUG" == "true" ]]; then
        echo "$roles" | jq -r '.[] | "  - \(.name) (ID: \(.id))"'
    fi
    
    # Get the first available role ID
    local role_id
    role_id=$(echo "$roles" | jq -r '.[0].id')
    
    if [[ -z "$role_id" || "$role_id" == "null" ]]; then
        error "Could not extract role ID"
        return 1
    fi
    
    log "Using role ID: $role_id for all users"
    
    local users_data
    users_data='[
        {"name":"John Smith","email":"john.smith@mychurch.com","password":"password123","phoneNumber":"255712345678"},
        {"name":"Mary Johnson","email":"mary.johnson@mychurch.com","password":"password123","phoneNumber":"255787654321"},
        {"name":"Robert Brown","email":"robert.brown@mychurch.com","password":"password123","phoneNumber":"255723456789"},
        {"name":"Sarah Davis","email":"sarah.davis@mychurch.com","password":"password123","phoneNumber":"255798765432"},
        {"name":"James Wilson","email":"james.wilson@mychurch.com","password":"password123","phoneNumber":"255756789012"},
        {"name":"Lisa Garcia","email":"lisa.garcia@mychurch.com","password":"password123","phoneNumber":"255734567890"}
    ]'
    
    while IFS= read -r user; do
        local email name phone user_payload
        email=$(echo "$user" | jq -r '.email')
        name=$(echo "$user" | jq -r '.name')
        phone=$(echo "$user" | jq -r '.phoneNumber')
        
        if entity_exists "$existing" "email" "$email"; then
            log "User already exists: $email"
        else
            user_payload=$(jq -n \
                --arg name "$name" \
                --arg email "$email" \
                --arg password "password123" \
                --arg phone "$phone" \
                --arg role "$role_id" \
                '{name:$name, email:$email, password:$password, phoneNumber:$phone, roleId:$role}')
            
            debug "Creating user with payload: $user_payload"
            
            if result=$(post_json "$API_BASE_URL/user" "$user_payload"); then
                log "Created user: $email"
                ((created++))
            else
                warn "Failed to create user: $email"
            fi
        fi
    done < <(echo "$users_data" | jq -c '.[]')
    
    log "Users created: $created"
}

# Generate members using existing fellowships
generate_members() {
    log "Generating members..."
    local existing fellowships created=0 attempts=0
    
    # Fetch existing members
    log "Fetching existing members..."
    if ! existing=$(get_json "$API_BASE_URL/member"); then
        error "Failed to fetch existing members"
        return 1
    fi
    
    debug "Existing members count: $(echo "$existing" | jq length)"
    
    # Fetch available fellowships
    log "Fetching fellowships for member assignment..."
    if ! fellowships=$(get_json "$API_BASE_URL/fellowship"); then
        error "Failed to fetch fellowships from API"
        return 1
    fi
    
    debug "Fellowships response received for member assignment"
    
    # Simple validation - just check if we can parse it and get a length
    local fellowship_count
    if fellowship_count=$(echo "$fellowships" | jq length 2>/dev/null); then
        debug "Successfully parsed fellowships JSON, found $fellowship_count fellowship(s)"
    else
        error "Failed to parse fellowships JSON response"
        debug "Raw response: $fellowships"
        return 1
    fi
    
    if (( fellowship_count == 0 )); then
        error "No fellowships found in the system"
        return 1
    fi
    
    log "Found $fellowship_count fellowship(s)"
    if [[ "$DEBUG" == "true" ]]; then
        echo "$fellowships" | jq -r '.[] | "  - \(.name) (ID: \(.id))"'
    fi
    
    # Extract fellowship IDs
    local fellowship_ids
    readarray -t fellowship_ids < <(echo "$fellowships" | jq -r '.[].id')
    
    if (( ${#fellowship_ids[@]} == 0 )); then
        error "No fellowship IDs extracted"
        return 1
    fi
    
    log "Using ${#fellowship_ids[@]} fellowship(s) for member assignment"
    
    local count target needed
    count=$(echo "$existing" | jq length)
    target=30
    needed=$((target - count))
    
    if (( needed <= 0 )); then
        log "Members already at or above target ($count/$target)"
        return 0
    fi
    
    log "Creating $needed members (current: $count, target: $target)"
    
    # Name lists
    local first_names=(
        "John" "Mary" "Robert" "Sarah" "Michael" "Jennifer" "David" "Lisa" "James" "Emily"
        "William" "Jessica" "Richard" "Ashley" "Joseph" "Amanda" "Thomas" "Melissa" "Christopher" "Deborah"
        "Daniel" "Dorothy" "Paul" "Amy" "Mark" "Angela" "Donald" "Helen" "Steven" "Brenda"
        "Peter" "Emma" "Kenneth" "Olivia" "Joshua" "Cynthia" "Kevin" "Marie" "Brian" "Janet"
        "George" "Catherine" "Edward" "Frances" "Ronald" "Christine" "Timothy" "Samantha" "Jason" "Debra"
    )
    
    local last_names=(
        "Smith" "Johnson" "Williams" "Brown" "Jones" "Garcia" "Miller" "Davis" "Rodriguez" "Martinez"
        "Hernandez" "Lopez" "Gonzalez" "Wilson" "Anderson" "Thomas" "Taylor" "Moore" "Jackson" "Martin"
        "Lee" "Perez" "Thompson" "White" "Harris" "Sanchez" "Clark" "Ramirez" "Lewis" "Robinson"
    )
    
    local places=("Dar es Salaam" "Arusha" "Dodoma" "Mwanza" "Tanga" "Zanzibar")
    local occupations=("Teacher" "Engineer" "Doctor" "Nurse" "Accountant" "Manager" "Lawyer" "Farmer")
    local marital_statuses=("Single" "Married" "Married" "Single")
    local education_levels=("Primary" "Secondary" "Certificate" "Diploma" "Bachelors")
    
    local max_attempts=$((needed * 3))
    
    while (( created < needed && attempts < max_attempts )); do
        ((attempts++))
        
        local fname lname gender dob phone email area birthplace occ marital edu fid marriage_type
        fname=$(get_random_element "${first_names[@]}")
        lname=$(get_random_element "${last_names[@]}")
        gender=$([ $((RANDOM % 2)) -eq 0 ] && echo "Male" || echo "Female")
        dob=$(random_date 1960 2000)
        phone=$(random_phone)
        email="${fname,,}.${lname,,}.${attempts}@example.com"
        area="Block $((RANDOM % 20 + 1)), House $((RANDOM % 50 + 1))"
        birthplace=$(get_random_element "${places[@]}")
        occ=$(get_random_element "${occupations[@]}")
        marital=$(get_random_element "${marital_statuses[@]}")
        edu=$(get_random_element "${education_levels[@]}")
        fid=$(get_random_element "${fellowship_ids[@]}")
        
        # Set marriage type based on marital status
        if [[ "$marital" == "Married" ]]; then
            # 80% Christian, 20% Non-Christian for married people
            if (( RANDOM % 5 == 0 )); then
                marriage_type="Non-Christian"
            else
                marriage_type="Christian"
            fi
        else
            marriage_type="None"
        fi
        
        local data
        if ! data=$(jq -n \
            --arg fn "$fname" --arg ln "$lname" --arg gen "$gender" \
            --arg dob "$dob" --arg phone "$phone" --arg email "$email" \
            --arg area "$area" --arg occ "$occ" --arg birth "$birthplace" \
            --arg fid "$fid" --arg marital "$marital" --arg edu "$edu" \
            --arg marriage_type "$marriage_type" \
            '{
                firstName: $fn,
                lastName: $ln,
                gender: $gen,
                dateOfBirth: $dob,
                phoneNumber: $phone,
                email: $email,
                residenceArea: $area,
                placeOfBirth: $birth,
                occupation: $occ,
                educationLevel: $edu,
                maritalStatus: $marital,
                marriageType: $marriage_type,
                memberRole: "Regular",
                isBaptized: true,
                isConfirmed: true,
                partakesLordSupper: true,
                fellowshipId: $fid,
                attendsFellowship: true,
                dependants: [],
                interests: []
            }'); then
            error "Failed to generate JSON data for member: $fname $lname"
            continue
        fi
        
        debug "Creating member: $fname $lname (attempt $attempts)"
        debug "Fellowship ID: $fid"
        
        if result=$(post_json "$API_BASE_URL/member" "$data"); then
            log "Created member: $fname $lname"
            ((created++))
        else
            warn "Failed to create member: $fname $lname (attempt $attempts)"
            debug "Failed data: $data"
            # Continue trying instead of failing completely
        fi
    done
    
    if (( created < needed )); then
        warn "Only created $created out of $needed needed members after $attempts attempts"
    else
        log "Successfully created $created members"
    fi
    
    return 0  # Always return success to continue with the script
}

# Assign fellowship leaders using existing members
assign_leaders_to_fellowships() {
    log "Assigning fellowship leaders..."
    local fellowships members assigned=0
    
    # Fetch current data
    log "Fetching fellowships for leadership assignment..."
    if ! fellowships=$(get_json "$API_BASE_URL/fellowship"); then
        error "Failed to fetch fellowships"
        return 1
    fi
    
    log "Fetching members for leadership assignment..."
    if ! members=$(get_json "$API_BASE_URL/member"); then
        error "Failed to fetch members"
        return 1
    fi
    
    while IFS= read -r fellowship; do
        local fid fname current_chairman
        fid=$(echo "$fellowship" | jq -r '.id')
        fname=$(echo "$fellowship" | jq -r '.name')
        current_chairman=$(echo "$fellowship" | jq -r '.chairmanId // ""')
        
        # Skip if already has leadership
        if [[ -n "$current_chairman" && "$current_chairman" != "null" ]]; then
            log "Fellowship '$fname' already has leadership assigned"
            continue
        fi
        
        # Get members for this fellowship
        local member_ids
        readarray -t member_ids < <(echo "$members" | jq -r "map(select(.fellowshipId == \"$fid\")) | .[].id")
        
        debug "Fellowship '$fname' has ${#member_ids[@]} members"
        
        if (( ${#member_ids[@]} >= 3 )); then
            # Shuffle member IDs
            local shuffled_ids
            readarray -t shuffled_ids < <(safe_shuffle "${member_ids[@]}")
            
            local data
            data=$(jq -n \
                --arg name "$fname" \
                --arg chairman "${shuffled_ids[0]}" \
                --arg secretary "${shuffled_ids[1]}" \
                --arg treasurer "${shuffled_ids[2]}" \
                '{
                    name: $name,
                    chairmanId: $chairman,
                    secretaryId: $secretary,
                    treasurerId: $treasurer
                }')
            
            debug "Assigning leaders to '$fname'"
            
            if result=$(patch_json "$API_BASE_URL/fellowship/$fid" "$data"); then
                log "Assigned leaders to fellowship: $fname"
                ((assigned++))
            else
                warn "Failed to assign leaders to fellowship: $fname"
            fi
        else
            warn "Fellowship '$fname' has insufficient members for leadership (has ${#member_ids[@]}, needs 3)"
        fi
    done < <(echo "$fellowships" | jq -c '.[]')
    
    log "Leaders assigned to $assigned fellowships"
}

# Display summary
display_summary() {
    log "=== DATA GENERATION SUMMARY ==="
    
    local rc uc fc mc flc
    rc=$(get_json "$API_BASE_URL/role" 2>/dev/null | jq length || echo "0")
    uc=$(get_json "$API_BASE_URL/user" 2>/dev/null | jq length || echo "0")
    fc=$(get_json "$API_BASE_URL/fellowship" 2>/dev/null | jq length || echo "0")
    mc=$(get_json "$API_BASE_URL/member" 2>/dev/null | jq length || echo "0")
    flc=$(get_json "$API_BASE_URL/fellowship" 2>/dev/null | jq '[.[] | select(.chairmanId != null and .chairmanId != "")] | length' || echo "0")
    
    echo "📊 Final entity counts:"
    echo "  - Roles: $rc (existing, not created)"
    echo "  - Users: $uc"
    echo "  - Fellowships: $fc"
    echo "  - Members: $mc"
    echo "  - Fellowships with assigned leaders: $flc/$fc"
}

# Main execution
main() {
    echo -e "${BLUE}=== Church Management System - Data Generator ===${NC}"
    echo "API Endpoint: $API_BASE_URL"
    echo "Debug Mode: $DEBUG"
    echo ""
    
    # Check dependencies
    log "Checking dependencies..."
    command -v curl >/dev/null || { error "curl command not found"; exit 1; }
    command -v jq >/dev/null || { error "jq command not found"; exit 1; }
    
    # Test connectivity
    log "Testing API connectivity..."
    if ! curl -s --connect-timeout 5 "$API_BASE_URL/auth/login" >/dev/null; then
        error "Cannot connect to API at $API_BASE_URL"
        exit 1
    fi
    
    # Initialize authentication
    initialize
    
    # Test all API endpoints before proceeding
    if ! test_api_endpoints; then
        error "API endpoint tests failed"
        exit 1
    fi
    
    log "Starting data generation process..."
    
    # Generate entities in dependency order
    if ! generate_fellowships; then
        warn "Fellowship generation had issues, but continuing..."
    fi
    sleep 1
    
    if ! generate_users; then
        warn "User generation had issues, but continuing..."
    fi
    sleep 1
    
    if ! generate_members; then
        warn "Member generation had issues, but continuing..."
    fi
    sleep 1
    
    if ! assign_leaders_to_fellowships; then
        warn "Leadership assignment had issues, but continuing..."
    fi
    
    echo ""
    display_summary
    echo ""
    echo -e "${GREEN}✅ Data generation completed!${NC}"
}

main "$@"