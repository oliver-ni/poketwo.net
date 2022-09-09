import { APIUser } from "discord-api-types/v9";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2020-08-27" });

export type CheckoutOptions = {
    user: APIUser;
    line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    success_url: string;
    cancel_url: string;
};

export const checkout = async ({ user, line_items, success_url, cancel_url }: CheckoutOptions) => {
    let customer = {};

    if (user.email) {
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });
        if (customers["data"].length > 0) {
            customer = { customer: customers["data"][0].id };
        }
    }

    if (!customer) {
        customer = { customer_email: user.email };
    }

    return await stripe.checkout.sessions.create({
        mode: "payment",
        allow_promotion_codes: true,
        payment_intent_data: { metadata: { ...(user as any) } },
        metadata: { ...(user as any) },
        line_items,
        success_url,
        cancel_url,
        ...customer,
    });
};
