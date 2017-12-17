function createGame(gameId) {
	return fetch(`/api/game`, {
		method: 'post'
	});
}

export default {
	createGame
};
