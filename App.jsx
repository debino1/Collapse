import { useState, useEffect } from "react"
import { clsx } from "clsx"
import { supports } from "./supports.js"
import { getFarewellText, getRandomWord } from "./utils.js"
import Confetti from "react-confetti"

export default function Collapse() {
    // State values
    const [currentWord, setCurrentWord] = useState("loading")
    const [guessedLetters, setGuessedLetters] = useState([])
    const [isLoadingWord, setIsLoadingWord] = useState(false)

    // Initialize with first word
    useEffect(() => {
        loadNewWord()
    }, [])

    async function loadNewWord() {
        setIsLoadingWord(true)
        try {
            const newWord = await getRandomWord()
            setCurrentWord(newWord)
        } catch (error) {
            console.error('Failed to load word:', error)
            setCurrentWord("bridge") // Fallback word
        } finally {
            setIsLoadingWord(false)
        }
    }

    // Derived values
    const numSupportsLeft = supports.length - 1
    const wrongGuessCount =
        guessedLetters.filter(letter => !currentWord.includes(letter)).length
    const isGameWon =
        currentWord !== "loading" && currentWord.split("").every(letter => guessedLetters.includes(letter))
    const isGameLost = wrongGuessCount >= numSupportsLeft
    const isGameOver = isGameWon || isGameLost
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
    const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

    // Static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    function addGuessedLetter(letter) {
        setGuessedLetters(prevLetters =>
            prevLetters.includes(letter) ?
                prevLetters :
                [...prevLetters, letter]
        )
    }

    async function startNewGame() {
        setGuessedLetters([])
        await loadNewWord()
    }

    const supportElements = supports.map((support, index) => {
        const isSupportDestroyed = index < wrongGuessCount
        const styles = {
            backgroundColor: support.backgroundColor,
            color: support.color
        }
        const className = clsx("chip", isSupportDestroyed && "destroyed")
        return (
            <span
                className={className}
                style={styles}
                key={support.name}
            >
                {support.name}
            </span>
        )
    })

    const letterElements = currentWord === "loading" ? 
        Array(7).fill(null).map((_, index) => (
            <span key={index} className="loading-letter">
                ?
            </span>
        )) :
        currentWord.split("").map((letter, index) => {
            const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
            const letterClassName = clsx(
                isGameLost && !guessedLetters.includes(letter) && "missed-letter"
            )
            return (
                <span key={index} className={letterClassName}>
                    {shouldRevealLetter ? letter.toUpperCase() : ""}
                </span>
            )
        })

    const keyboardElements = alphabet.split("").map(letter => {
        const isGuessed = guessedLetters.includes(letter)
        const isCorrect = isGuessed && currentWord.includes(letter)
        const isWrong = isGuessed && !currentWord.includes(letter)
        const className = clsx({
            correct: isCorrect,
            wrong: isWrong
        })

        return (
            <button
                className={className}
                key={letter}
                disabled={isGameOver || currentWord === "loading"}
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                onClick={() => addGuessedLetter(letter)}
            >
                {letter.toUpperCase()}
            </button>
        )
    })

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessIncorrect
    })

    function renderGameStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <p className="farewell-message">
                    {getFarewellText(supports[wrongGuessCount - 1].name)}
                </p>
            )
        }

        if (isGameWon) {
            return (
                <>
                    <h2>Bridge secured!🌉</h2>
                    <p>Well done! The bridge stands strong!</p>
                </>
            )
        }
        if (isGameLost) {
            return (
                <>
                    <h2>Structural Failure!</h2>
                    <p>The bridge collapsed! 💥 Better luck next time! 😭</p>
                </>
            )
        }

        return null
    }

    return (
        <main>
            
            <header>
                <h1>Bridge: Under Pressure</h1>
                <p>Guess the word within 8 attempts to keep the
                bridge from collapsing!</p>
            </header>

            <section
                aria-live="polite"
                role="status"
                className={gameStatusClass}
            >
                {renderGameStatus()}
            </section>

            <section className="bridge-container">
                <div className="bridge-abutment left-abutment"></div>
                <div className="bridge-deck"></div>
                <div className="bridge-pillars">
                    {supportElements}
                </div>
                <div className="bridge-abutment right-abutment"></div>
                <div className="water-surface"></div>
            </section>

            <section className="word">
                {letterElements}
            </section>

            {/* Combined visually-hidden aria-live region for status updates */}
            <section
                className="sr-only"
                aria-live="polite"
                role="status"
            >
                <p>
                    {currentWord.includes(lastGuessedLetter) ?
                        `Correct! The letter ${lastGuessedLetter} is in the word.` :
                        `Sorry, the letter ${lastGuessedLetter} is not in the word.`
                    }
                    You have {numSupportsLeft} supports remaining.
                </p>
                <p>Current word: {currentWord.split("").map(letter =>
                    guessedLetters.includes(letter) ? letter + "." : "blank.")
                    .join(" ")}</p>

            </section>

            <section className="keyboard">
                {keyboardElements}
            </section>

            {isGameOver &&
                <button
                    className="new-game"
                    onClick={startNewGame}
                    disabled={isLoadingWord}
                >{isLoadingWord ? "Loading..." : "New Game"}</button>}
        </main>
    )
}
