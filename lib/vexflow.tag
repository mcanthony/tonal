<vexflow>
  <div>
    <canvas id="vex" width="800" height="100"></canvas>
  </div>

  <script>
    var vexflow = require('./vexflow.js')
    this.on('update', function() {
      vexflow(this.vex, 800, 100, this.opts.notes)
    })
  </script>
</vexflow>
