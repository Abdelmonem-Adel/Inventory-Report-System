import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../DB/models/user.model.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value.toLowerCase();
      console.log(`[Passport] Attempting login for email: ${email}`);

      // 1. Domain Restriction
      if (!email.endsWith('@breadfast.com')) {
        console.log(`[Passport] Domain check FAILED for: ${email}`);
        return done(null, false, { message: 'Only @breadfast.com domain is allowed.' });
      }
      console.log(`[Passport] Domain check PASSED for: ${email}`);

      // 2. Whitelisting check
      let user = await User.findOne({ email });

      if (!user) {
        console.log(`[Passport] Whitelist check FAILED for: ${email} (User not found in DB)`);
        return done(null, false, { message: 'Access denied: Email not whitelisted.' });
      }
      console.log(`[Passport] Whitelist check PASSED for: ${email}`);

      // 3. Update user with Google info if not present
      if (!user.googleId) {
        console.log(`[Passport] Linking Google ID to existing user: ${email}`);
        user.googleId = profile.id;
        user.avatar = profile.photos[0]?.value;
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      console.error(`[Passport] Error during strategy:`, err);
      return done(err, null);
    }
  }
));

// No sessions used, but Passport requires these for internal flow if not handled
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;
