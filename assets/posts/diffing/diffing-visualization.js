class DiffVisualization extends React.Component {
constructor(props) {
  super(props)

  this.state = {
    view: "diff",
    showUnified: props.showUnified || false,
    leftText: props.leftText,
    rightText: props.rightText,
    ...this.computeDiff(props.leftText, props.rightText)
  }
}

render () {
  return React.createElement("div", {className: "diff-visualization"},
    React.createElement("h4", null, "Live Demo: ", this.props.title),
     this.state.view == "edit" ? this.renderEdit() : this.renderDiff()
)
}

renderEdit () {
  return React.createElement("div", null,
    React.createElement("div", {className: "diff-wrapper"},
      React.createElement("div", {className: "diff-side"},
        React.createElement("textarea", {ref: "leftTextarea",
          value: this.state.leftText,
          style: {height: this.state.leftTextAreaHeight + "px"},
          onChange: this.handleLeftTextarea.bind(this)})
       ),
      React.createElement("div", {className: "diff-side right-diff-side"},
        React.createElement("textarea", {ref: "rightTextarea",
          value: this.state.rightText,
          style: {height: this.state.rightTextAreaHeight + "px"},
          onChange: this.handleRightTextarea.bind(this)})
      )
   ),
   React.createElement("button", {onClick: this.switchState.bind(this)}, "Show diff")
  )
}

renderDiff (height) {
  if (this.state.showUnified) {
    return React.createElement("div", null,
             React.createElement("div", {className: "diff-wrapper"},
               React.createElement("div", {className: "diff-full"},
                 React.createElement("ul", {className: "diff-results"},
                   this.state.unifiedDiff.map(this.renderDiffElement.bind(this))
                 )
               )
            ),
            React.createElement("button", {onClick: this.switchState.bind(this)}, "Edit")
          )
  } else {
  return React.createElement("div", null,
           React.createElement("div", {className: "diff-wrapper"},
             React.createElement("div", {className: "diff-side"},
               React.createElement("ul", {className: "diff-results"},
                 this.state.leftDiff.map(this.renderDiffElement.bind(this))
               )
             ),
             React.createElement("div", {className: "diff-side right-diff-side"},
               React.createElement("ul", {className: "diff-results"},
                 this.state.rightDiff.map(this.renderDiffElement.bind(this))
               )
             )
           ),
           React.createElement("button", {onClick: this.switchState.bind(this)}, "Edit")
         )
   }
}

renderDiffElement (element) {
  return React.createElement("li", {className: "diff-change diff-" + element.type}, element.content)
}

componentDidUpdate() {
  if (this.state.view == "edit" &&
          (this.state.leftTextAreaHeight != this.refs.leftTextarea.scrollHeight
        || this.state.rightTextAreaHeight != this.refs.rightTextarea.scrollHeight)) {
    this.setState({
      leftTextAreaHeight: this.refs.leftTextarea.scrollHeight,
      rightTextAreaHeight: this.refs.rightTextarea.scrollHeight
    })
  }
}

switchState(e) {
  if (this.state.view == "edit") {
    this.setState({view: "diff",
                   ...this.computeDiff(this.state.leftText, this.state.rightText)})
  } else{
    this.setState({view: "edit"})
  }
}

handleLeftTextarea (e) {
  // HACK: This needs to be set outside of React apparently.
  e.target.style.height = 'inherit'
  e.target.style.height = e.target.scrollHeight + "px"
  this.setState({ leftText: e.target.value, leftTextAreaHeight: e.target.scrollHeight })
}

handleRightTextarea (e) {
// HACK: This needs to be set outside of React apparently.
  e.target.style.height = 'inherit'
  e.target.style.height = e.target.scrollHeight + "px"
  this.setState({ rightText: e.target.value, rightTextAreaHeight: e.target.scrollHeight })
}

computeDiff (leftText, rightText) {
  var leftText = leftText.split("\n")
  var rightText = rightText.split("\n")

  var unifiedDiff = diff(leftText, rightText)
  var {left, right} = diff_to_sxs_diff(unifiedDiff)

  return { leftDiff: left, rightDiff: right, unifiedDiff }
}
}

class DiffingElement {
constructor(type, content) {
  this.type = type
  this.content = content
}
}

Addition = (content) => new DiffingElement("added", content)
Removal = (content) => new DiffingElement("removed", content)
Unchanged = (content) => new DiffingElement("unchanged", content)
Buffer = (content) => new DiffingElement("buffer", "")

function compute_longest_common_subsequence(text1, text2) {
const n = text1.length
const m = text2.length

var lcs = Array.from(Array(n + 1), () => Array(m + 1) )

for(var i = 0; i <= n; i++) {
  for(var j = 0; j <= m; j++) {
    if (i == 0 || j == 0) {
      lcs[i][j] = 0
    } else if (text1[i - 1] == text2[j - 1]) {
      lcs[i][j] = 1 + lcs[i - 1][j - 1]
    } else {
      lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1])
    }
  }
}

return lcs
}

function diff(text1, text2) {
const lcs = compute_longest_common_subsequence(text1, text2)
var results = []

var i = text1.length
var j = text2.length

while(i != 0 || j != 0) {
  if (i == 0) {
    results.push(Addition(text2[j - 1]))
    j -= 1
  } else if (j == 0) {
    results.push(Removal(text1[i - 1]))
    i -= 1
  } else if (text1[i - 1] == text2[j - 1]) {
    results.push(Unchanged(text1[i - 1]))
    i -= 1
    j -= 1
  } else if (lcs[i - 1][j] <= lcs[i][j - 1]) {
    results.push(Addition(text2[j - 1]))
    j -= 1
  } else {
    results.push(Removal(text1[i - 1]))
    i -= 1
  }
}

return results.reverse()
}

function diff_to_sxs_diff(diff) {
left = []
right = []

var last_free_i = 0

for (var i = 0; i < diff.length; i++) {
  const element = diff[i];

  if (element.type == "removed") {
    left.push(element)
  }

  if (element.type == "added") {
    right.push(element)
  }

  if (element.type == "unchanged" || i == diff.length - 1) {
    const pad = Math.max(left.length, right.length)
    const addLeft = Math.max(0, pad - left.length)
    const addRight = Math.max(0, pad - right.length)

    left = left.concat(Array(addLeft).fill(Buffer()))
    right = right.concat(Array(addRight).fill(Buffer()))
  }

  if (element.type == "unchanged") {
    last_free_i = i;
    left.push(element)
    right.push(element)
  }
}

return { left, right }
}


ReactDOM.render(React.createElement(DiffVisualization, {
                title: "Diff Visualization",
                leftText: "Here\nis\nan\nold\ncommit\nand\nsome\nmore\ntext",
                rightText: "This\nis\nthe\nmost\nrecent\ncommit\nwith\nsome\ntext" }),
document.getElementById("demo-initial"))

ReactDOM.render(React.createElement(DiffVisualization, {
                title: "Unified Diff View",
                leftText: "Here\nis\nan\nold\ncommit\nand\nsome\nmore\ntext",
                rightText: "This\nis\nthe\nmost\nrecent\ncommit\nwith\nsome\ntext",
                showUnified: true}),
document.getElementById("demo-unified"))

ReactDOM.render(React.createElement(DiffVisualization, {
                title: "Split Diff View",
                leftText: "Here\nis\nan\nold\ncommit\nand\nsome\nmore\ntext",
                rightText: "This\nis\nthe\nmost\nrecent\ncommit\nwith\nsome\ntext",
                showUnified: false}),
document.getElementById("demo-split"))


var left = `function oldFunction () {
  some();
  code();
}`

var right = `function oldFunction () {
  some();
  code();
}

function newFunction () {
  new();
  code();
}`

ReactDOM.render(React.createElement(DiffVisualization, {
                title: "Confusing diff with one function added",
                leftText: left,
                rightText: right,
                showUnified: false}),
document.getElementById("demo-suboptimal"))
