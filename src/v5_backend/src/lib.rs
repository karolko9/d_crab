use std::collections::HashMap;
use std::cell::RefCell;
use candid::CandidType;
use sha2::{Sha256, Digest};
use candid::Principal;



#[derive(Debug, Default, CandidType, Clone)] // deserialize
struct VotePoll {
    pub poll_id: String,
    pub poll_name: String,
    pub public: bool,
    pub author_principal: String,
    pub voters: Vec<String>, // Wektor z id ludzi, którzy zagłosowali
    pub votes: Vec<Vec<Vec<String>>>, // Tablica 3D przechowująca identyfikatory osób głosujących na każdą komórkę
}



thread_local! {
    static VOTE_POLLS: RefCell<HashMap<String, VotePoll>> = RefCell::new(HashMap::new());
}

fn generate_poll_id(poll_name: &str, author_id: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(poll_name);
    hasher.update(author_id);
    let result = hasher.finalize();
    // Use a longer portion of the hash to avoid collisions
    format!("{:x}", result)[..32].to_string()
}

// Validate input string to avoid potential security issues
fn validate_input(input: &str, max_length: usize, field_name: &str) {
    if input.trim().is_empty() {
        ic_cdk::trap(&format!("{} cannot be empty.", field_name));
    }
    if input.len() > max_length {
        ic_cdk::trap(&format!("{} exceeds max length of {} characters.", field_name, max_length));
    }
}


            
#[ic_cdk::update]
fn create_vote_poll(author_principal1: String, poll_name1: String, public1: bool) {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous callers are not allowed to create vote poll.");
    }

    validate_input(&author_principal1, 128, "Author principal");
    validate_input(&poll_name1, 128, "Poll name");

    VOTE_POLLS.with(|polls| {
        let mut polls_map = polls.borrow_mut();
        if polls_map.values().any(|poll| poll.poll_name == poll_name1) {
            ic_cdk::trap("Poll with the same name already exists");
        }

        let new_poll = VotePoll {
            poll_id: generate_poll_id(&poll_name1, &author_principal1),
            poll_name: poll_name1.clone(),
            public: public1,
            author_principal: author_principal1,
            voters: HashSet::new(),
            votes: vec![vec![Vec::new(); 24]; 7], // 24x7 table for votes
        };

        polls_map.insert(new_poll.poll_id.clone(), new_poll); // Use poll_id as the key
    });
}

#[ic_cdk::query]
fn get_vote_polls_names_and_ids_by_author(author_principal1: String) -> Vec<Vec<String>> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous callers are not allowed.");
    }
    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        polls_map.values()
            .filter(|poll| poll.author_principal == author_principal1)
            .map(|poll| vec![poll.poll_id.clone(), poll.poll_name.clone()])
            .collect()
    })
}

#[ic_cdk::query]
fn get_vote_poll_by_id(poll_id1: String) -> VotePoll {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous callers are not allowed.");
    }
    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        let poll = polls_map.values()
            .find(|poll| poll.poll_id.clone() == poll_id1.clone())
            .unwrap_or_else(|| panic!("Poll not found for id: {}", poll_id1))
            .clone(); 
        poll
    })
}



#[ic_cdk::update]
fn add_vote(voter_id1: String, poll_id1: String, selected_cells: Vec<Vec<usize>>) {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous callers are not allowed.");
    }

    validate_input(&voter_id1, 128, "Voter ID");
    validate_input(&poll_id1, 64, "Poll ID");

    VOTE_POLLS.with(|polls| {
        let mut polls_map = polls.borrow_mut();
        let poll_name1 = get_pollname_by_pollid(&poll_id1);

        if let Some(poll) = polls_map.get_mut(&poll_name1) {
            // Remove any previous votes by this voter
            poll.votes.iter_mut().for_each(|day| {
                day.iter_mut().for_each(|hour| {
                    hour.retain(|id| id != &voter_id1);
                });
            });

            // Add new votes based on selected cells
            for cell in selected_cells {
                if cell.len() != 2 || cell[0] >= 24 || cell[1] >= 7 {
                    ic_cdk::trap("Invalid day or hour for voting.");
                }
                poll.votes[cell[1]][cell[0]].push(voter_id1.clone());
            }

            // Add voter to the set of voters, preventing duplicates
            poll.voters.insert(voter_id1.clone());
        } else {
            ic_cdk::trap("Poll not found");
        }
    });
}

fn get_pollname_by_pollid(poll_id1: &str) -> String {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous callers are not allowed.");
    }

    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        polls_map
            .values()
            .find(|poll| poll.poll_id == poll_id1)
            .map(|poll| poll.poll_name.clone())
            .unwrap_or_else(|| ic_cdk::trap(&format!("Poll with ID {} not found", poll_id1)))
    })
}


#[ic_cdk::query]
fn get_all_vote_polls_string() -> String {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous callers are not allowed.");
    }
    let mut result = String::new();

    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        for (_, poll) in polls_map.iter() {
            result.push_str(&format!("{:?}\n", poll));
        }
    });
    result
}

#[ic_cdk::query]
fn get_all_vote_polls() -> Vec<VotePoll> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Anonymous callers are not allowed.");
    }
    VOTE_POLLS.with(|polls| {
        let polls_map = polls.borrow();
        polls_map.values().cloned().collect()
    })
}

#[ic_cdk::query]
fn greet(name: String, principal: String) -> String {
    validate_input(&name, 128, "Name");
    validate_input(&principal, 128, "Principal");

    format!("Hello, {}! principal:{}", name, principal)
}


ic_cdk::export_candid!();
