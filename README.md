# Kwizbus
 A simple online tool for creating and taking multiple-choice quizzes.

## Features
- Create your own quizzes and MCQ tests
- Attempt tests made by others
- Generate tests using Google's Gemini models

## Notes
- Copy Link button embeds the quiz in the URL itself. The quiz data is first compressed using `lz-string` then URL encoded to produce the permalink URL.
