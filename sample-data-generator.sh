#!/opt/homebrew/bin/bash

# Church Membership Management System - Sample Data Generator
# Generates sample data using API endpoints

set -euo pipefail

# Configuration
API_PORT="${API_PORT:-8585}"  # Use API_PORT env var, or default to 8585 if not set
API_BASE_URL="http://localhost:${API_PORT}"
AUTH_TOKEN=""
CHURCH_ID=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Arrays
declare -a ROLES=()
declare -a USERS=()
declare -a MEMBERS=()
declare -a FELLOWSHIPS=()
declare -a OPPORTUNITIES=()

# Logging helpers
log()   { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Bash version check
if [[ "${BASH_VERSINFO[0]}" -lt 4 ]]; then
    error "Bash version 4 or higher is required."
    exit 1
fi

# Utility functions
random_date() {
    local start_year=$1 end_year=$2
    local year=$((start_year + RANDOM % (end_year - start_year + 1)))
    local month=$((1 + RANDOM % 12))
    local day=$((1 + RANDOM % 28))
    printf "%04d-%02d-%02d" $year $month $day
}

get_random_element() {
    local arr=("$@")
    echo "${arr[RANDOM % ${#arr[@]}]}"
}

random_phone() {
    echo "255$((RANDOM % 9 + 1))$(printf "%07d" $((RANDOM % 10000000)))"
}

# Initialization
initialize() {
    log "Authenticating..."
    local response
    response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"username":"admin@mychurch.com","password":"guest"}' \
        "$API_BASE_URL/auth/login")

    if echo "$response" | jq -e '.token' &>/dev/null; then
        AUTH_TOKEN=$(echo "$response" | jq -r '.token')
        CHURCH_ID=$(echo "$response" | jq -r '.user.churchId')
        log "Authenticated. Church ID: $CHURCH_ID"
    else
        error "Authentication failed: $response"
        exit 1
    fi
}

# JSON POST helper with status check
post_json() {
    local url=$1 data=$2
    local tmpfile=$(mktemp)
    local status
    status=$(curl -s -w "%{http_code}" -o "$tmpfile" -X POST \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$data" "$url")

    if [[ "$status" =~ ^20[01]$ ]]; then
        cat "$tmpfile"
        rm "$tmpfile"
        return 0
    else
        error "POST to $url failed with status $status"
        cat "$tmpfile"
        rm "$tmpfile"
        return 1
    fi
}

generate_roles() {
    log "Generating roles..."
    local existing_roles=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/role")

    local roles_data='[
        {"name": "Moderator", "description": "Can manage members and fellowships"},
        {"name": "Viewer", "description": "Read-only access to system data"}
    ]'

    echo "$roles_data" | jq -c '.[]' | while read -r role; do
        local role_name=$(echo "$role" | jq -r '.name')
        if echo "$existing_roles" | jq -e ".[] | select(.name == \"$role_name\")" >/dev/null; then
            log "Role exists: $role_name"
        else
            local result=$(post_json "$API_BASE_URL/role" "$role") || continue
            log "Created role: $role_name"
            ROLES+=("$result")
        fi
    done
}

generate_users() {
    log "Generating users..."
    local existing_users=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/user")
    local roles=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/role")

    local moderator_role_id=$(echo "$roles" | jq -r '.[] | select(.name == "Moderator") | .id')
    local viewer_role_id=$(echo "$roles" | jq -r '.[] | select(.name == "Viewer") | .id')

    local users_data=$(jq -n --arg mod "$moderator_role_id" --arg view "$viewer_role_id" '[
        {"name":"John Smith","email":"john.smith@mychurch.com","password":"password123","phoneNumber":"255712345678","roleId":$mod},
        {"name":"Mary Johnson","email":"mary.johnson@mychurch.com","password":"password123","phoneNumber":"255787654321","roleId":$mod},
        {"name":"Robert Brown","email":"robert.brown@mychurch.com","password":"password123","phoneNumber":"255723456789","roleId":$view},
        {"name":"Sarah Davis","email":"sarah.davis@mychurch.com","password":"password123","phoneNumber":"255798765432","roleId":$view}
    ]')

    echo "$users_data" | jq -c '.[]' | while read -r user; do
        local email=$(echo "$user" | jq -r '.email')
        if echo "$existing_users" | jq -e ".[] | select(.email == \"$email\")" >/dev/null; then
            log "User exists: $email"
        else
            result=$(post_json "$API_BASE_URL/user" "$user") || continue
            log "Created user: $(echo "$user" | jq -r '.name')"
            USERS+=("$result")
        fi
    done
}

generate_opportunities() {
    log "Generating opportunities..."
    local existing=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/opportunity")

    local opps='[
        {"name":"Main Choir","description":"Sing in the main church choir"},
        {"name":"Sunday School Teacher","description":"Teach children"},
        {"name":"Usher","description":"Assist with order"},
        {"name":"Youth Leader","description":"Lead youth activities"},
        {"name":"Worship Team","description":"Lead musical worship"},
        {"name":"Outreach Team","description":"Community evangelism"},
        {"name":"Hospitality Team","description":"Serve refreshments"}
    ]'

    echo "$opps" | jq -c '.[]' | while read -r opp; do
        local name=$(echo "$opp" | jq -r '.name')
        if echo "$existing" | jq -e ".[] | select(.name == \"$name\")" >/dev/null; then
            log "Opportunity exists: $name"
        else
            result=$(post_json "$API_BASE_URL/opportunity" "$opp") || continue
            log "Created opportunity: $name"
            OPPORTUNITIES+=("$result")
        fi
    done
}

generate_fellowships() {
    log "Generating fellowships..."
    local names=("Bethany" "Tumaini" "Grace" "Faith" "Hope" "Cornerstone" "Emmanuel")
    local existing=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/fellowship")

    for name in "${names[@]}"; do
        if echo "$existing" | jq -e ".[] | select(.name == \"$name\")" >/dev/null; then
            log "Fellowship exists: $name"
        else
            local data=$(jq -n --arg name "$name" --arg note "$name fellowship group" \
                '{name:$name, notes:$note}')
            result=$(post_json "$API_BASE_URL/fellowship" "$data") || continue
            log "Created fellowship: $name"
            FELLOWSHIPS+=("$result")
        fi
    done
}

generate_members() {
    log "Generating members..."
    local existing=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/member")
    local fellowships=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/fellowship")
    local fellowship_ids=($(echo "$fellowships" | jq -r '.[].id'))
    local count=$(echo "$existing" | jq length)
    local needed=$((20 - count))
    if (( needed <= 0 )); then
        log "Sufficient members exist"
        return
    fi

    local first=("John" "Mary" "Robert" "Sarah" "Michael" "Jennifer")
    local last=("Smith" "Johnson" "Williams" "Brown" "Jones")
    local places=("Dar es Salaam" "Arusha" "Dodoma")
    local occupations=("Teacher" "Engineer" "Doctor")

    for ((i=0; i<needed; i++)); do
        local fname=$(get_random_element "${first[@]}")
        local lname=$(get_random_element "${last[@]}")
        local gender=$([ $((RANDOM % 2)) -eq 0 ] && echo "Male" || echo "Female")
        local dob=$(random_date 1944 2006)
        local phone=$(random_phone)
        local email="${fname,,}.${lname,,}@example.com"
        local area="Block $((RANDOM % 10 + 1))"
        local birthplace=$(get_random_element "${places[@]}")
        local occupation=$(get_random_element "${occupations[@]}")
        local fid=$(get_random_element "${fellowship_ids[@]}")

        local data=$(jq -n --arg fn "$fname" --arg ln "$lname" --arg gen "$gender" \
            --arg dob "$dob" --arg phone "$phone" --arg email "$email" \
            --arg area "$area" --arg occ "$occupation" --arg birth "$birthplace" \
            --arg fid "$fid" '{
                firstName:$fn, lastName:$ln, gender:$gen,
                dateOfBirth:$dob, phoneNumber:$phone,
                email:$email, residenceArea:$area,
                placeOfBirth:$birth, occupation:$occ,
                memberRole:"Regular", isBaptized:true, isConfirmed:true,
                partakesLordSupper:true, fellowshipId:$fid, attendsFellowship:true,
                dependants:[], interests:[]
            }')

        result=$(post_json "$API_BASE_URL/member" "$data") || continue
        log "Created member: $fname $lname"
        MEMBERS+=("$result")
    done
}

assign_leaders_to_fellowships() {
    log "Assigning fellowship leaders..."
    local fellowships=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/fellowship")
    local members=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE_URL/member")

    echo "$fellowships" | jq -c '.[]' | while read -r fellowship; do
        local fid=$(echo "$fellowship" | jq -r '.id')
        local fname=$(echo "$fellowship" | jq -r '.name')
        local ids=($(echo "$members" | jq -r "map(select(.fellowshipId == \"$fid\")) | .[].id"))

        if (( ${#ids[@]} >= 3 )); then
            local shuffled=($(shuf -e "${ids[@]}"))
            local data=$(jq -n --arg name "$fname" \
                --arg c "${shuffled[0]}" --arg s "${shuffled[1]}" --arg t "${shuffled[2]}" '{
                    name:$name, chairmanId:$c, secretaryId:$s, treasurerId:$t
                }')
            curl -s -X PATCH -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$data" "$API_BASE_URL/fellowship/$fid" >/dev/null
            log "Assigned leaders to $fname"
        else
            warn "Not enough members in $fname to assign leaders"
        fi
    done
}

main() {
    echo -e "${BLUE}=== Sample Data Generator ===${NC}"
    command -v curl >/dev/null || { error "curl not found"; exit 1; }
    command -v jq >/dev/null || { error "jq not found"; exit 1; }

    initialize
    generate_roles
    generate_users
    generate_opportunities
    generate_fellowships
    generate_members
    assign_leaders_to_fellowships

    echo -e "${GREEN}Sample data generation complete.${NC}"
}

main "$@"
