var FSM = function(states) {
    this.states = states
    this.state = this.states.start
    this.state_name = 'start'
}

FSM.prototype.handle = function(event, data) {
	var res = null
	var target = this.state[event]
	if(target) {
		try {
			res = target(this, data)
		} catch(e) {
			if(this.onexception) {
				this.onexception(this, e)
			} else {
				throw e
			}
		}
	} 
	return res
}

FSM.prototype.trans = function(target) {
	var new_state = this.states[target]
	if(new_state) {
		if(this.state.onexit) {
			this.state.onexit(this, null)
		}

		this.state_name = target
		this.state = new_state
		if(this.state.onenter) {
			this.state.onenter(this, null)
		}
	}
}

FSM.prototype.start = function(event) {
	this.states.start(this, event)
}
