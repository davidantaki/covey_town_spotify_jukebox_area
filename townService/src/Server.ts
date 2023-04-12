import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import { AddressInfo } from 'net';
import swaggerUi from 'swagger-ui-express';
import { ValidateError } from 'tsoa';
import fs from 'fs/promises';
import { Server as SocketServer } from 'socket.io';
import * as dotenv from 'dotenv';
import { RegisterRoutes } from '../generated/routes';
import TownsStore from './lib/TownsStore';
import { ClientToServerEvents, ServerToClientEvents } from './types/CoveyTownSocket';
import { TownsController } from './town/TownsController';
import { logError } from './Utils';
import SpotifyController, { SpotifyTokenResponse } from './spotify/SpotifyController';

// Create the server instances
const app = Express();
app.use(CORS());
const server = http.createServer(app);
const socketServer = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: '*' },
});
dotenv.config();

const { CLIENT_URL } = process.env;

// Initialize the towns store with a factory that creates a broadcast emitter for a town
TownsStore.initializeTownsStore((townID: string) => socketServer.to(townID));

// Connect the socket server to the TownsController. We use here the same pattern as tsoa
// (the library that we use for REST), which creates a new controller instance for each request
socketServer.on('connection', socket => {
  new TownsController().joinTown(socket);
});

// Set the default content-type to JSON
app.use(Express.json());

// Add a /docs endpoint that will display swagger auto-generated documentation
app.use('/docs', swaggerUi.serve, async (_req: Express.Request, res: Express.Response) => {
  const swaggerSpec = await fs.readFile('../shared/generated/swagger.json', 'utf-8');
  return res.send(swaggerUi.generateHTML(JSON.parse(swaggerSpec)));
});

// Register the TownsController routes with the express server
RegisterRoutes(app);

// Add a middleware for Express to handle errors
app.use(
  (
    err: unknown,
    _req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction,
  ): Express.Response | void => {
    if (err instanceof ValidateError) {
      return res.status(422).json({
        message: 'Validation Failed',
        details: err?.fields,
      });
    }
    if (err instanceof Error) {
      logError(err);
      return res.status(500).json({
        message: 'Internal Server Error',
      });
    }

    return next();
  },
);

/**
 * Callback endpoint where the "redirect uri" is located and the user can
 * go to. This is where we get the exchange the authorization code for the
 * authentication token.
 *
 * Inspiration from here:
 * https://stackoverflow.com/questions/49788580/how-to-redirect-to-correct-client-route-after-social-auth-with-passport-react
 * http://gregtrowbridge.com/node-authentication-with-google-oauth-part2-jwts/
 */
app.get('/callback', async (req, res) => {
  const code = (req.query.code as string) || null;
  try {
    const response: SpotifyTokenResponse = await SpotifyController.token(code);
    if (response.status !== 200) {
      res.send(`Error: ${res}`);
      return;
    }
    // console.log(response);
    const token = response.data.access_token;
    res.redirect(`${CLIENT_URL}/jukebox-spotify-login/save-auth-token/${token}`);
    // console.log(`token:${token}`);
  } catch (error) {
    res.send(`Error: ${error}`);
  }
});

// Start the configured server, defaulting to port 8081 if $PORT is not set
server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    TownsStore.getInstance().createTown(process.env.DEMO_TOWN_ID, false);
  }
});
