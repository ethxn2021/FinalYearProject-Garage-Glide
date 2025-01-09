import { getBasketItemsForCustomer } from "./db.server";

export async function handleGetBasketItems(req: Request, res: Response) {
  const customerId = req.params.customerId; // Assuming the customer ID is passed as a parameter
  try {
    const basketItems = await getBasketItemsForCustomer(customerId);
    res.json({ basketItems });
  } catch (error) {
    res.status(500).json({ error: "Error fetching basket items" });
  }
}