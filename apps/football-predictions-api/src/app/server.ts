import Fastify, { FastifyInstance } from 'fastify';

const server: FastifyInstance = Fastify();

server.get('/ping', async () => {
	return 'pong'	
})

server.listen(8080, (err, address) => {
	if (err) {
		console.log(err);
		process.exit(1)
	}

	console.log(`Server listening at ${address}`)
})
