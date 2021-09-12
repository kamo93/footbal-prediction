import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import axiosPlugin from 'fastify-axios';

const fastify: FastifyInstance = Fastify();



const apiKey = 'd63e45381888c7b5179c725d41ae4cd7';
const footballPredictionsApi = 'https://v3.football.api-sports.io';
fastify.register(axiosPlugin, {
	baseURL: footballPredictionsApi,
	headers: {
		'x-apisports-key': apiKey
	}
})

interface Fixture {
	id: string;
	teams: {
		home: {
			id: string;
			name: string;
			logo: string;
			winner: boolean;
		};
		away: {
			id: string;
			name: string;
			logo: string;
			winner: boolean;
		}
	}
}

const colombianLeagueId = '239';
const season = '2021';

const logNice = (data: any) => {
	console.log(JSON.stringify(data, null, 2))
}

// TODO get next dates matches and actual so decided which are closer
const getFixtures = async (from: string, to: string): Promise<Array<Fixture>> => {
	console.log('params', from, to);
	const timezone = 'America/Bogota';
	let fixtures = [];
	// @ts-ignore
	const { data: { response }, status } = await fastify.axios.get('/fixtures', { params: { league: colombianLeagueId, season, timezone, from, to } })
	if (status === 200) {
		logNice(response);
		if (response.length) {
			fixtures = response.map(({ fixture, teams }) => {
				return {
					id: fixture.id,
					teams: { ...teams }
				}
			})
		}
	}
	return fixtures
}

const getMatchesPredictions = async (fixtures: Array<Fixture>) => {

	const promisesPredictions = fixtures.map(({ id: fixtureId }) => {
		// @ts-ignore
		return fastify.axios.get('/predictions', {params:{fixture: fixtureId}})
	});

	const predictionsResponse = await Promise.all(promisesPredictions);
	logNice(predictionsResponse);
}

const predictionOpts: RouteShorthandOptions = {
	schema: {
		querystring: {
			from: { type: 'string' },
			to: { type: 'string' }
		},
	}
}

type PredictionQueryString = {
	from: string;
	to: string;
}

fastify.get<{ Querystring: PredictionQueryString }>('/api/prediction', predictionOpts, async (request) => {
	const { from, to } = request.query;

	try {
		const fixtures = await getFixtures(from, to);
		logNice(fixtures);
		await getMatchesPredictions(fixtures);

	} catch (err) {
		console.log(err)
	}
	return 'hello world'
})

const startServer = async () => {
	try {
		await fastify.listen(8080);
		// @ts-ignore
		fastify.log.info(`Server listening on ${fastify.server.address().port}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

startServer();
