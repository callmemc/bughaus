function createGame() {
	return fetch(`/api/game`, {
		method: 'post'
  	});
}

export default {
	createGame
};

