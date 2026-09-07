const formatProductPrompt = (data)=>{
  return `You are a professional product copywriter.  
Write a clear, engaging, and SEO‑friendly description for a product based on the following details:  

- Product Name: ${data.name} 

Guidelines:
- Begin with a compelling one‑line hook that highlights the product’s main benefit.  
- Provide a concise overview of its features, specifications, and unique selling points.  
- Use persuasive yet approachable language that appeals to customers.  
- Mention the brand naturally to build trust and recognition.  
- Keep the description between 100–150 words.  
  `
}
export default formatProductPrompt;