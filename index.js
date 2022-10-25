import { OpenSeaStreamClient } from '@opensea/stream-js';
import { WebSocket } from 'ws';
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv'; 
dotenv.config()

const client = new OpenSeaStreamClient({
  token: process.env.OPENSEA_API,
  connectOptions: {
    transport: WebSocket
  }
});

const twitterclient = new TwitterApi({
    appKey:process.env.APP_KEY,
    appSecret:process.env.APP_SECRET,
    accessToken:process.env.ACCESS_TOKEN,
    accessSecret:process.env.ACCESS_SECRET
})

const rwClient = twitterclient.readWrite

client.onItemSold('*', (event) => {
    if(event.payload.sale_price >= 1000000000000000000 && event.payload.item.chain.name == "ethereum"){
        console.log(event.payload.collection.slug); 
        console.log(event.payload.item.permalink); 
        console.log(event.payload.sale_price);
        console.log(event.payload.item.metadata.image_url);
        tweet(event)
    }
    else{
      console.log("fish"); 
    }
})

const tweet = async (event ) => {
    var price_eth = event.payload.sale_price/1000000000000000000; 
    var price_usd = price_eth*event.payload.payment_token.usd_price; 
    var hastag = `#${event.payload.collection.slug} #boredape #blockchain #crypto #whalealert`;
    try{
        await rwClient.v2.tweet(
          {"text":`🐳🐳 \n Collection: ${event.payload.collection.slug} \n Sold for: ${price_eth} Eth (${price_usd} USD) \n Seller: ${event.payload.maker.address} \n Buyer: ${event.payload.taker.address} \n\n ${hastag} \n ${event.payload.item.permalink}`})
    } catch(e) {
        console.error(e)
    }
}
