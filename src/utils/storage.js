const GOALS_KEY = 'poolup_goals'

export const getGoals = () => {
  const data = localStorage.getItem(GOALS_KEY)
  return data ? JSON.parse(data) : []
}

export const saveGoal = (goal) => {
  const goals = getGoals()
  const newGoal = {
    ...goal,
    id: Date.now(),
    collected: 0,
    contributors: [],
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'active'
  }
  goals.push(newGoal)
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  return newGoal
}

export const contributeToGoal = (goalId, contribution) => {
  const goals = getGoals()
  const index = goals.findIndex(g => g.id === goalId)
  if (index === -1) return null
  goals[index].contributors.push(contribution)
  goals[index].collected += contribution.amount
  if (goals[index].collected >= goals[index].target) {
    goals[index].status = 'completed'
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  return goals[index]
}

export const getGoalById = (id) => {
  const goals = getGoals()
  return goals.find(g => g.id === parseInt(id)) || null
}