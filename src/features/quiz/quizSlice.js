import { createSlice } from "@reduxjs/toolkit";

const keyFor = (email) => `mennovaQuiz:${email}`;

function loadFor(email) {
  try {
    return JSON.parse(localStorage.getItem(keyFor(email))) || null;
  } catch {
    return null;
  }
}

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

const savedUser = currentUser();

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    answers: savedUser ? loadFor(savedUser.email) : null,
  },
  reducers: {
    // call after login
    loadQuiz: (state, action) => {
      state.answers = loadFor(action.payload);
    },
    // call when the quiz is finished
    saveQuiz: (state, action) => {
      const { email, answers } = action.payload;
      state.answers = answers;
      try {
        localStorage.setItem(keyFor(email), JSON.stringify(answers));
      } catch {
        // storage full: answers stay in memory for this session
      }
    },
    // call after logout / register
    clearQuiz: (state) => {
      state.answers = null;
    },
  },
});

export const { loadQuiz, saveQuiz, clearQuiz } = quizSlice.actions;
export default quizSlice.reducer;