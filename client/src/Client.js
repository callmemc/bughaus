function createGame(gameId) {
	return fetch(`/api/game`, {
		method: 'post',
    credentials: 'include'
	});
}

export default {
	createGame
};
