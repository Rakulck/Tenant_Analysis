# Google Maps API Setup Guide

This guide explains how to set up Google Maps API for the Tenant Default Analysis platform.

## Prerequisites

1. A Google Cloud Platform account
2. A project in Google Cloud Console
3. Billing enabled on your Google Cloud project

## Step 1: Enable Google Maps APIs

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable the following APIs:
   - **Maps JavaScript API** - For displaying maps and autocomplete functionality
   - **Places API** - For address autocomplete and place details
   - **Geocoding API** - For converting addresses to coordinates (optional, for additional features)

## Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 3: Restrict API Key (Recommended)

For security, restrict your API key to only the necessary APIs and domains:

1. Click on the API key you just created
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domain(s):
   - For development: `http://localhost:3000/*`
   - For production: `https://yourdomain.com/*`
4. Under "API restrictions", select "Restrict key"
5. Select the APIs you enabled in Step 1:
   - Maps JavaScript API
   - Places API
   - Geocoding API (if enabled)

## Step 4: Add API Key to Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Step 5: Verify Setup

1. Start your development server: `npm run dev`
2. Navigate to the Tenant Analysis page
3. Try typing in the address field - you should see autocomplete suggestions
4. Select an address - the city, state, and ZIP code should auto-fill
5. A map should appear showing the selected location

## Features Implemented

### Address Autocomplete
- Real-time address suggestions as you type
- Automatic parsing of address components (street, city, state, ZIP)
- US-only address restrictions for better accuracy

### Interactive Map
- Displays the selected property location
- Custom marker with property address
- Responsive design that works on mobile and desktop

### Coordinate Storage
- Latitude and longitude coordinates are captured and stored
- Coordinates are included in analysis requests for enhanced location-based insights

## Troubleshooting

### API Key Not Working
- Verify the API key is correctly set in your environment variables
- Check that the APIs are enabled in Google Cloud Console
- Ensure billing is enabled on your Google Cloud project
- Check the browser console for any error messages

### Autocomplete Not Working
- Verify the Places API is enabled
- Check that your domain is included in the API key restrictions
- Ensure the API key has the correct permissions

### Map Not Loading
- Verify the Maps JavaScript API is enabled
- Check that the API key is valid and has the correct restrictions
- Look for any JavaScript errors in the browser console

## Cost Considerations

Google Maps API has usage-based pricing. For typical usage:

- **Maps JavaScript API**: $7 per 1,000 map loads
- **Places API**: $17 per 1,000 autocomplete requests
- **Geocoding API**: $5 per 1,000 requests

For development and small-scale usage, these costs are typically very low. Monitor your usage in the Google Cloud Console to avoid unexpected charges.

## Security Best Practices

1. **Always restrict your API key** to specific domains and APIs
2. **Use environment variables** to store the API key, never hardcode it
3. **Monitor usage** regularly in Google Cloud Console
4. **Set up billing alerts** to avoid unexpected charges
5. **Use different API keys** for development and production environments

## Support

If you encounter issues:
1. Check the [Google Maps API documentation](https://developers.google.com/maps/documentation)
2. Review the browser console for error messages
3. Verify your API key and restrictions in Google Cloud Console
4. Check the Google Cloud Console for any quota or billing issues 