function getTimeEdittedLast(date) {
  return Math.ceil(
    (new Date().getTime() - new Date(date).getTime()) / 1000 / 60
  );
}

function getDefaultThoughts() {
  const thoughts = localStorage.getItem("thoughts");

  return thoughts ? JSON.parse(thoughts) : [];
}

const ThoughtReaction = props => {
  const { liked, favorite, handleLike, handleDislike } = props;
  return (
    <div className="thought-container">
      {props.children}
      <div className="reaction">
        <i
          className={`material-icons medium icon ${liked ? "selected" : ""}`}
          onClick={props.handleLike}
        >
          thumb_up_alt
        </i>
        <i
          className={`material-icons medium icon ${
            favorite ? "favorite-selected" : ""
          }`}
          onClick={props.handleDislike}
        >
          favorite
        </i>
      </div>
    </div>
  );
};

const Thought = React.memo(props => {
  const {
    thought,
    thoughtRef,
    handleCurrentThoughtSave,
    handleThoughtDelete,
    handleReaction
  } = props;
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [currentThought, setCurrentThought] = React.useState(thought.value);

  const handleCurrentThoughtChange = event => {
    setCurrentThought(event.target.value);
  };

  const toggleIsEditMode = () => {
    if (isEditMode) {
      handleCurrentThoughtSave(thought.key, currentThought);
    }

    setIsEditMode(!isEditMode);
  };

  return (
    <ThoughtReaction
      liked={thought.liked}
      favorite={thought.favorite}
      handleLike={handleReaction(thought.key, "liked", !thought.liked)}
      handleDislike={handleReaction(thought.key, "favorite", !thought.favorite)}
    >
      <div className="thought" ref={thoughtRef}>
        {isEditMode ? (
          <input
            type="text"
            className="edit-thought"
            placeholder="Write your thought and click enter"
            value={currentThought}
            onChange={handleCurrentThoughtChange}
          />
        ) : (
          <span className="thought-value">
            <p className="last-edited">
              Added/Edited by you {getTimeEdittedLast(thought.lastEditted)} min
              ago
            </p>
            {thought.value}
          </span>
        )}
        <div>
          <i
            className="material-icons icon medium edit-icon"
            onClick={toggleIsEditMode}
          >
            {isEditMode ? "save" : "edit"}
          </i>
          <i
            onClick={handleThoughtDelete(thought.key)}
            className="material-icons icon medium delete-icon"
          >
            delete
          </i>
        </div>
      </div>
    </ThoughtReaction>
  );
});

const Thoughts = props => {
  const {
    thoughts,
    thoughtRef,
    handleCurrentThoughtSave,
    handleThoughtDelete,
    handleReaction
  } = props;

  return (
    <div className="thoughts">
      {thoughts.map((thought, i) => (
        <Thought
          key={thought.key}
          thought={thought}
          handleCurrentThoughtSave={handleCurrentThoughtSave}
          handleThoughtDelete={handleThoughtDelete}
          handleReaction={handleReaction}
          thoughtRef={i === thoughts.length - 1 ? thoughtRef : null}
        />
      ))}
    </div>
  );
};

const Footer = () => {
  return (
    <p className="footer">
      Your data is saved in your browser. Reload to check :)
    </p>
  );
};

const App = () => {
  const [thoughts, setThoughts] = React.useState(getDefaultThoughts());
  const [currentThought, setCurrentThought] = React.useState("");
  const thoughtRef = React.useRef(null);

  // const scrollToRef = () => window.scrollTo(0, thoughtRef.current.offsetTop);
  const scrollToRef = () => {
    !!thoughtRef &&
      thoughtRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  };

  React.useEffect(() => {
    localStorage.setItem("thoughts", JSON.stringify(thoughts));
    if (thoughts.length) scrollToRef();
  }, [thoughts]);

  const handleCurrentThoughtChange = event => {
    setCurrentThought(event.target.value);
  };

  const handleCurrentThoughtSave = (key, value) => {
    setThoughts(thoughts => {
      return thoughts.map(thought => {
        if (thought.key === key) {
          thought.value = value;
          thought.lastEditted = Date.now();
        }

        return thought;
      });
    });
  };

  const handleCurrentThoughtEnter = target => {
    if (!currentThought.length) {
      return;
    }

    if (target.charCode === 13) {
      setThoughts(thoughts => [
        ...thoughts,
        {
          key: thoughts.length,
          value: currentThought,
          liked: false,
          favorite: false,
          lastEditted: Date.now()
        }
      ]);
      setCurrentThought("");
    }
  };

  const handleThoughtDelete = key => () => {
    setThoughts(thoughts => thoughts.filter(thought => thought.key !== key));
  };

  const handleReaction = (key, reactionKey, reactionVal) => () => {
    setThoughts(thoughts => {
      return thoughts.map(thought => {
        if (thought.key === key) {
          thought[reactionKey] = reactionVal;
        }

        return thought;
      });
    });
  };

  return (
    <div>
      <h1>My Thoughts App</h1>
      <Thoughts
        thoughts={thoughts}
        handleCurrentThoughtSave={handleCurrentThoughtSave}
        handleThoughtDelete={handleThoughtDelete}
        handleReaction={handleReaction}
        thoughtRef={thoughtRef}
      />
      <input
        type="text"
        className="create-thought"
        placeholder="Write your thought and click enter"
        value={currentThought}
        onChange={handleCurrentThoughtChange}
        onKeyPress={handleCurrentThoughtEnter}
        // autoFocus
      />
      <Footer />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
