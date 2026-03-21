#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, String, Vec,
    symbol_short
};

#[contracttype]
#[derive(Clone)]
pub struct Goal {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub target: i128,
    pub collected: i128,
    pub organiser: Address,
    pub deadline: u64,
    pub status: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct Contribution {
    pub contributor: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contract]
pub struct PoolUpContract;

#[contractimpl]
impl PoolUpContract {

    pub fn create_goal(
        env: Env,
        name: String,
        description: String,
        target: i128,
        deadline: u64,
        organiser: Address,
    ) -> u64 {
        organiser.require_auth();

        let mut count: u64 = env.storage().persistent()
            .get(&symbol_short!("GCNT"))
            .unwrap_or(0);

        count += 1;

        let goal = Goal {
            id: count,
            name,
            description,
            target,
            collected: 0,
            organiser,
            deadline,
            status: 0,
        };

        let key = (symbol_short!("GOALS"), count);
        env.storage().persistent().set(&key, &goal);
        env.storage().persistent().set(&symbol_short!("GCNT"), &count);

        // init empty contributors list
        let contribs: Vec<Contribution> = Vec::new(&env);
        let ckey = (symbol_short!("CLIST"), count);
        env.storage().persistent().set(&ckey, &contribs);

        count
    }

    pub fn contribute(
        env: Env,
        goal_id: u64,
        contributor: Address,
        amount: i128,
    ) {
        contributor.require_auth();

        let key = (symbol_short!("GOALS"), goal_id);
        let mut goal: Goal = env.storage().persistent()
            .get(&key)
            .expect("Goal not found");

        assert!(goal.status == 0, "Goal is not active");

        goal.collected += amount;

        if goal.collected >= goal.target {
            goal.status = 1;
        }

        env.storage().persistent().set(&key, &goal);

        // store contribution in list
        let ckey = (symbol_short!("CLIST"), goal_id);
        let mut contribs: Vec<Contribution> = env.storage().persistent()
            .get(&ckey)
            .unwrap_or(Vec::new(&env));

        contribs.push_back(Contribution {
            contributor,
            amount,
            timestamp: env.ledger().timestamp(),
        });

        env.storage().persistent().set(&ckey, &contribs);
    }

    pub fn get_goal(env: Env, goal_id: u64) -> Goal {
        let key = (symbol_short!("GOALS"), goal_id);
        env.storage().persistent()
            .get(&key)
            .expect("Goal not found")
    }

    pub fn get_contributors(env: Env, goal_id: u64) -> Vec<Contribution> {
        let ckey = (symbol_short!("CLIST"), goal_id);
        env.storage().persistent()
            .get(&ckey)
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_goal_count(env: Env) -> u64 {
        env.storage().persistent()
            .get(&symbol_short!("GCNT"))
            .unwrap_or(0)
    }

    pub fn get_progress(env: Env, goal_id: u64) -> i128 {
        let key = (symbol_short!("GOALS"), goal_id);
        let goal: Goal = env.storage().persistent()
            .get(&key)
            .expect("Goal not found");
        goal.collected
    }

    pub fn refund(env: Env, goal_id: u64) {
        let key = (symbol_short!("GOALS"), goal_id);
        let mut goal: Goal = env.storage().persistent()
            .get(&key)
            .expect("Goal not found");

        let current_time = env.ledger().timestamp();
        assert!(current_time > goal.deadline, "Deadline not passed yet");
        assert!(goal.status == 0, "Goal already completed or refunded");
        assert!(goal.collected < goal.target, "Goal was reached");

        goal.status = 2;
        env.storage().persistent().set(&key, &goal);
    }
}