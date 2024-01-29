import express, { Application, Request, Response } from "express";
import cors from "cors";
import Stripe from "stripe";
const stripe = new Stripe("sk_test_...");

import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.post("/payment", async (req: Request, res: Response) => {
	console.log(req.body);

	res.send({ url: "https://buy.stripe.com/test_14kdRl2Hz7jC9d6144" });
});


const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRECT||"";

app.post(
	"/webhook",
	express.raw({ type: "application/json" }),
	(request, response) => {
		const sig = request.headers["stripe-signature"] || "";
		let event;

		try {
			event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
			console.log("event", event);
		} catch (error) {
			console.log("error", error);
			response.status(400).send(`Webhook Error: error=${error}`);
			return;
		}

		switch (event.type) {
			case "invoice.payment_succeeded": {
				const checkoutSessionAsyncPaymentSucceeded = event.data.object;
				console.log(
					"payment succeded form hook listen",
					checkoutSessionAsyncPaymentSucceeded
				);
				console.log("Event Handled", event.type);

				break;
			}

			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		response.send(200);
	}
);

app.listen(PORT, () =>
	console.log(`Server running on http://localhost:${PORT}`)
);
