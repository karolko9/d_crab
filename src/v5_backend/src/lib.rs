use std::collections::HashMap;
use std::cell::RefCell;
use candid::CandidType;
use sha2::{Sha256, Digest};
use candid::Principal;
use candid::Deserialize;
use std::fmt;

#[derive(Debug, Default, CandidType, Clone)]
struct VotePoll {
    pub poll_id: String,
    pub poll_name: String,
    pub public: bool,
    pub author_principal: String,
    pub voters: Vec<String>, 
    pub votes: Vec<Vec<Vec<String>>>, // 3D array representing votes by day and hour
}

#[derive(Debug, CandidType, Deserialize)]
pub enum PollError {
    PollNotFound(String),
    PollExists(String),
    InvalidInput,
    AnonymousNotAllowed,
}

impl fmt::Display for PollError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PollError::PollNotFound(id) => write!(f, "Poll with ID {} not found", id),
            PollError::PollExists(name) => write!(f, "Poll with the name {} already exists", name),
            PollError::InvalidInput => write!(f, "Invalid input provided"),
            PollError::AnonymousNotAllowed => write!(f, "Anonymous callers are not allowed"),
        }
    }
}

impl std::error::Error for PollError {}

type PollResult<T> = Result<T, PollError>;

thread_local! {
    static VOTE_POLLS: RefCell<HashMap<String, VotePoll>> = RefCell::new(HashMap::new());
}

/// Generate a poll ID based on the poll name and author ID
fn generate_poll_id(poll_name: &str, author_id: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(poll_name);
    hasher.update(author_id);
    let result = hasher.finalize();
    format!("{:x}", result)[..15].to_string()
}

/// Validate the inputs to prevent empty or invalid poll names or author IDs
fn validate_input(poll_name: &str, author_id: &str) -> PollResult<()> {
    if poll_name.is_empty() || author_id.is_empty() {
        return Err(PollError::InvalidInput);
    }
    Ok(())
}

/// Ensure the caller is not anonymous
fn ensure_non_anonymous(caller: Principal) -> PollResult<()> {
    if caller == Principal::anonymous() {
        return Err(PollError::AnonymousNotAllowed);
    }
    Ok(())
}

/// Create a new vote poll
#[ic_cdk::update]
fn create_vote_poll(author_principal1: String, poll_name1: String, public1: bool) -> PollResult<()> {
    let caller = ic_cdk::caller();
    ensure_non_anonymous(caller)?;
    validate_input(&poll_name1, &author_principal1)?;

    VOTE_POLLS.with(|polls| {
        let mut polls_map = polls.borrow_mut();
        if polls_map.contains_key(&poll_name1) {
            return Err(PollError::PollExists(poll_name1.clone()));
        }

        let new_poll = VotePoll {
            poll_id: generate_poll_id(&poll_name1, &author_principal1),
            poll_name: poll_name1.clone(),
            public: public1,
            author_principal: author_principal1,
            voters: Vec::new(),
            votes: vec![vec![Vec::new(); 24]; 7], // 7 days x 24 hours
        };
        polls_map.insert(poll_name1, new_poll);
        Ok(())
    })
}

/// Retrieve vote polls by the author's principal
#[ic_cdk::query]
fn get_vote_polls_names_and_ids_by_author(author_principal1: String) -> PollResult<Vec<Vec<String>>> {
    let caller = ic_cdk::caller();
    ensure_non_anonymous(caller)?;

    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        let results: Vec<Vec<String>> = polls_map
            .values()
            .filter(|poll| poll.author_principal == author_principal1)
            .map(|poll| vec![poll.poll_id.clone(), poll.poll_name.clone()])
            .collect();
        
        Ok(results)
    })
}

/// Fetch a vote poll by its ID
#[ic_cdk::query]
fn get_vote_poll_by_id(poll_id1: String) -> PollResult<VotePoll> {
    let caller = ic_cdk::caller();
    ensure_non_anonymous(caller)?;

    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        polls_map
            .values()
            .find(|poll| poll.poll_id == poll_id1)
            .cloned()
            .ok_or(PollError::PollNotFound(poll_id1))
    })
}

/// Add a vote to a poll with error handling
#[ic_cdk::update]
fn add_vote(voter_id1: String, poll_id1: String, selected_cells: Vec<Vec<usize>>) -> PollResult<()> {
    let caller = ic_cdk::caller();
    ensure_non_anonymous(caller)?;

    let poll_name1 = get_pollname_by_pollid(poll_id1.clone())?;
    VOTE_POLLS.with(|polls| {
        let mut polls_map = polls.borrow_mut();
        if let Some(poll) = polls_map.get_mut(&poll_name1) {
            // Remove existing votes if voter already voted
            if poll.voters.contains(&voter_id1) {
                for day in poll.votes.iter_mut() {
                    for hour in day.iter_mut() {
                        hour.retain(|id| id != &voter_id1);
                    }
                }
            }

            // Add new votes
            for cell in selected_cells {
                if cell.len() == 2 && cell[0] < 24 && cell[1] < 7 {
                    poll.votes[cell[1]][cell[0]].push(voter_id1.clone());
                } else {
                    return Err(PollError::InvalidInput); // Invalid day or hour index
                }
            }

            // Add voter if not already added
            if !poll.voters.contains(&voter_id1) {
                poll.voters.push(voter_id1);
            }
        } else {
            return Err(PollError::PollNotFound(poll_id1));
        }
        Ok(())
    })
}

/// Helper function to get poll name by poll ID
fn get_pollname_by_pollid(poll_id1: String) -> PollResult<String> {
    let caller = ic_cdk::caller();
    ensure_non_anonymous(caller)?;

    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        polls_map
            .values()
            .find(|poll| poll.poll_id == poll_id1)
            .map(|poll| poll.poll_name.clone())
            .ok_or(PollError::PollNotFound(poll_id1))
    })
}

/// Get all vote polls as a formatted string
#[ic_cdk::query]
fn get_all_vote_polls_string() -> PollResult<String> {
    let caller = ic_cdk::caller();
    ensure_non_anonymous(caller)?;

    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        let mut result = String::new();
        for (_, poll) in polls_map.iter() {
            result.push_str(&format!("{:?}\n", poll));
        }
        Ok(result)
    })
}

/// Get all vote polls as a vector of `VotePoll`
#[ic_cdk::query]
fn get_all_vote_polls() -> PollResult<Vec<VotePoll>> {
    let caller = ic_cdk::caller();
    ensure_non_anonymous(caller)?;

    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        Ok(polls_map.values().cloned().collect())
    })
}

/// Simple greeting function
#[ic_cdk::query]
fn greet(name: String, principal: String) -> String {
    format!("Hello, {}! Principal: {}", name, principal)
}

ic_cdk::export_candid!();
