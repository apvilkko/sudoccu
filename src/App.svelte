<script>
  import { onMount } from 'svelte'
  import SudokuBoard from './SudokuBoard.svelte'
  import NumberPicker from './NumberPicker.svelte'
  import createStore from './board/store'
  import { getBoard, getDim, getSize } from './board/selectors'
  import {
    INIT,
    UPDATE_CANDIDATES,
    APPLY_STEPS,
    HIGHLIGHT,
    ENTER_NUMBER,
    UNDO,
    KEY_EVENT,
    SET_PENCIL,
    SET_BOARD
  } from './board/actions/constants'
  import { updateCandidates } from './v2/engine/candidates'
  //import { randomizePuzzle } from './board/generate'
  import { solve } from './engine/solver'
  import { isSolved as isCellSolved } from './board/actions/cell'
  import formatSteps from './formatSteps'
  import { generatePuzzle } from './v2/engine/generate'

  let store, board, state
  let loading = false
  let difficulty = 0
  let desiredDifficulty = 50
  let steps = null
  let generateFn
  let error = null
  let theme = 'dark'
  let playerBoard

  const THEMES = ['dark', 'light']

  $: {
    if (theme) {
      const els = document.getElementsByTagName('link')
      const current = `${theme}.css`
      let found = false
      for (let i = 0; i < els.length; ++i) {
        const href = els[i].href.split('/').pop()
        if (href === 'bundle.css') {
          continue
        }
        if (href !== current) {
          found = true
          els[i].href = els[i].href
            .replace(href, current)
            .split('/')
            .pop()
        }
      }
      if (!found) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = current
        document.head.appendChild(link)
      }
    }
  }

  const generate = () => {
    loading = true
    /* randomizePuzzle(store, desiredDifficulty)
      .then(({ difficulty: puzzleDifficulty, steps: solutionSteps }) => {
        store.dispatch({ type: UPDATE_CANDIDATES, payload: { solved: true } });
        state = store.getState();
        difficulty = puzzleDifficulty;
        loading = false;
        steps = solutionSteps;
        error = null;
      })
      .catch(err => {
        // loading = false;
        console.log("CAUGHT:", err);
        error = err;
        setTimeout(() => {
          generate();
        }, 100);
      });
    */
    const generated = generatePuzzle(desiredDifficulty)
    console.log(generated)
    difficulty = generated.difficulty
    playerBoard = generated.playerBoard
    store.dispatch({
      type: SET_BOARD,
      payload: {
        ...generated,
        initialBoard: generated.playerBoard.data
      }
    })
    updateCandidates(playerBoard, true)
    state = store.getState()
    loading = false
  }

  const updateSteps = () => {
    const state = store.getState()
    steps = solve(getSize(state))(getBoard(state))
  }

  const applyNextStep = () => {
    updateSteps()
    if (steps && steps.length > 0) {
      store.dispatch({ type: HIGHLIGHT, payload: { cell: {} } })
      store.dispatch({ type: APPLY_STEPS, payload: steps.slice(0, 1) })
      store.dispatch({ type: UPDATE_CANDIDATES })
      state = store.getState()
    }
    setTimeout(() => {
      updateSteps()
    }, 100)
  }

  const handleCellClick = (value, x, y) => {
    store.dispatch({ type: HIGHLIGHT, payload: { value, x, y } })
    state = store.getState()
  }

  const handleNumberEntry = value => {
    store.dispatch({ type: ENTER_NUMBER, payload: { value } })
  }

  const handleAction = action => {
    if (action === 'pencil') {
      store.dispatch({ type: SET_PENCIL })
    } else if (action === 'undo') {
      store.dispatch({ type: UNDO })
    } else {
      handleNumberEntry(action)
    }
    state = store.getState()
  }

  const nextTheme = () => {
    theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
  }

  const HANDLED_KEYS = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'Delete',
    'p',
    't'
  ]

  const handleKeydown = evt => {
    if (HANDLED_KEYS.includes(evt.key)) {
      evt.preventDefault()
      if (evt.key === 'p') {
        store.dispatch({ type: SET_PENCIL })
      } else if (evt.key === 't') {
        nextTheme()
      } else {
        store.dispatch({ type: KEY_EVENT, payload: { value: evt.key } })
      }
      state = store.getState()
    }
  }

  const handleSize = () => {
    const landscape = window.innerWidth > window.innerHeight
    document.body.className = landscape ? 'landscape' : 'portrait'
  }

  onMount(() => {
    store = createStore()
    store.dispatch({ type: INIT })
    state = store.getState()
    generate()

    window.addEventListener('resize', handleSize)
    window.addEventListener('orientationchange', handleSize)
    handleSize()
  })
</script>

<svelte:window on:keydown={handleKeydown} />

{#if store}
  <div class="container">
    <h1>Sudoccu</h1>
    <div class="layout">
      <div>
        {#if loading}
          <p>Generating, please wait</p>
        {:else if error !== null}
          <p>{error}</p>
        {:else}
          <div class="board-container">
            <SudokuBoard {store} {state} {handleCellClick} />
          </div>
        {/if}
      </div>
      <div>
        <NumberPicker {handleAction} pencil={state.pencil} />
      </div>
      <div>
        <div class="controls">
          <button on:click={generate} disabled={loading}>Generate</button>
          <button on:click={applyNextStep} disabled={loading}>
            Apply next step
          </button>
          <label>
            Difficulty:
            <input type="number" bind:value={desiredDifficulty} />
          </label>
          <div>
            {#each [70, 80, 90, 100, 105, 110] as preset}
              <button
                on:click={() => {
                  desiredDifficulty = preset
                  generate()
                }}>
                {preset}
              </button>
            {/each}
          </div>
        </div>
        <p>Difficulty: {difficulty}</p>
        <div class="steps">
          {#each formatSteps(steps).split('\n') as step}
            {step}
            <br />
          {/each}
        </div>
      </div>
    </div>
    <div>
      <label for="theme">Theme</label>
      <select
        id="theme"
        name="theme"
        on:change={evt => {
          theme = evt.target.value
        }}>
        {#each THEMES as themeChoice}
          <option value={themeChoice} selected={theme === 'themeChoice'}>
            {themeChoice}
          </option>
        {/each}
      </select>
    </div>
  </div>
{/if}
