use std::collections::HashMap;
use std::cell::RefCell;
use sha2::{Sha256, Digest};



#[derive(Debug, Default)]
struct VotePoll {
    poll_id: String,
    poll_name: String,
    public: bool,
    author_principal: String,
    voters: Vec<String>, // Wektor z id ludzi, którzy zagłosowali
    votes: Vec<Vec<Vec<String>>>, // Tablica 3D przechowująca identyfikatory osób głosujących na każdą komórkę
}

thread_local! {
    static VOTE_POLLS: RefCell<HashMap<String, VotePoll>> = RefCell::new(HashMap::new());
}

fn generate_poll_id(poll_name: &str, author_id: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(poll_name);
    hasher.update(author_id);
    let result = hasher.finalize();
    format!("{:x}", result)
}

#[ic_cdk::update]
fn create_vote_poll(author_principal1: String, poll_name1: String, public1: bool) {
    VOTE_POLLS.with(|polls| {
        let mut polls_map = polls.borrow_mut();
        if !polls_map.contains_key(&poll_name1) {
            let new_poll = VotePoll {
                poll_id: generate_poll_id(&poll_name1, &author_principal1),
                poll_name: poll_name1.clone(),
                public: public1,
                author_principal: author_principal1,
                voters: Vec::new(),
                votes: vec![vec![Vec::new(); 24]; 7], // Inicjalizacja tablicy 24x7
            };
            polls_map.insert(poll_name1, new_poll);
        } else {
            panic!("Poll with the same name already exists");
        }
    });
}


#[ic_cdk::update]
fn add_vote(voter_id1: String, poll_name1: String, selected_cells: Vec<Vec<usize>>) {
    VOTE_POLLS.with(|polls| {
        let mut polls_map = polls.borrow_mut();
        if let Some(poll) = polls_map.get_mut(&poll_name1) {
            if poll.voters.contains(&voter_id1) {
                poll.votes.iter_mut().for_each(|day| {
                    day.iter_mut().for_each(|hour| {
                        hour.retain(|id| id != &voter_id1);
                    });
                });
            }
            for cell in selected_cells {
                if cell[0] < poll.votes.len() && cell[1] < poll.votes[cell[0]].len() {
                    poll.votes[cell[0]][cell[1]].push(voter_id1.clone());
                } else {
                    panic!("Invalid day or hour");
                }
            }
            if !poll.voters.contains(&voter_id1) {
                poll.voters.push(voter_id1);
            }
        } else {
            panic!("Poll not found");
        }
    });
}


#[ic_cdk::query]
fn get_all_vote_polls_string() -> String {
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
fn greet(name: String, principal: String) -> String {
    format!("Hello, {}! principal:{}", name,  principal)
}

ic_cdk::export_candid!();