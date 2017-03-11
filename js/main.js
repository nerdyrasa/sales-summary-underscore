require([
    "jquery",
    "bootstrap",
    "underscore-min",
    "jquery.mockjax",
    "jquery.mockjson",
    "rainbow-custom.min",
    "employees"], function($) {

    $(function() {

        $('article').html('' +
    '<div id="api-attribute-container">' +
    '   <span id="native-flag" class="api-attribute hidden" title="Uses native API if available."><i class="icon-certificate"></i>E5</span>' +
    '   <span id="context-flag" class="api-attribute hidden" title="Includes \'context\' as last parameter."><i class="icon-plus"></i>Context</span>' +
    '</div>' +
    '<h1>' +
    '   <a href="http://underscorejs.org/#" id="apiAnchor" target="_blank"></a>' +
    '   <span id="aliasContainer" class="muted hidden"> alias: <span id="aliasList"></span></span>' +
    '</h1>' +
    '<div class="row-fluid">' +
    '    <div class="span7">' +
    '        <ul class="nav nav-tabs" id="steps"></ul>' +
    '        <div id="elements"></div>' +
    '        <div id="tab-content-container" class="tab-content"></div>' +
    '        <button class="btn-large pull-right" id="run-button">Run <i class="icon-play"></i></button>' +
    '        <div id="clear-button-container" class="pull-right"><a href="#" id="clear-button">Clear</a></div>' +
    '    </div>' +
    '    <div class="span5">' +
    '        <h5 class="muted">Result</h5>' +
    '        <div id="result" class="well"></div>' +
    '    </div>' +
    '</div>');

        var
            blocks = $('script[data-step]'),
            steps = $('#steps'),
            step = 1,
            className = '',
            label = '',
            tabContentContainer = $('#tab-content-container'),
            aliasContainer = $('#aliasContainer'),
            titleElement = $('meta[name="title"]'),
            title = titleElement.attr('content'),
            nolink = titleElement.attr('data-nolink'),
            urlHash = titleElement.attr('data-urlhash'),
            apiAnchor = $('#apiAnchor'),
            elements = $('#elements'),
            aliasList = $('meta[name="alias"]').attr('content'),
            native = $('meta[name="native"]'),
            context = $('meta[name="context"]'),
            listingOnlyMessage = '<h4 class="text-info">This code listing is for explanation purposes only and does not produce a value.</h4><p><img src="img/fist-pump-baby.jpg" /></p>',

            changeStep = function(step) {
                var code, container, lines;

                if (!step) {
                    _commands.currentStep++;
                } else {
                    _commands.currentStep = step;
                }

                code = $('script[data-step="' + _commands.currentStep + '"]').text();
                code = code.split('//---')[1];
                lines = code.split('\n');

                for (var i = 0; i < lines.length; i++) {
                    lines[i] = lines[i].replace(/                /, '');
                }

                code = lines.join('\n') + '\n';

                Rainbow.color(code, 'javascript', function(result) {
                    container = $('code#code-step' + _commands.currentStep).html(result);
                });
            };

        _.each(blocks, function(element, index, list) {
            className = step === 1 ? 'active' : '';
            label = element.getAttribute('data-label');

            steps.append('<li class="' +
                className + '"><a href="#step' +
                step + '" data-toggle="tab" data-step="' +
                step + '">' + label + '</li>');

            tabContentContainer.append('' +
                '<div class="tab-pane ' +
                className + '" id="step' +
                step + '"><pre>' +
                '<code id="code-step' +
                step + '" data-language="javascript"></code></pre></div>');

            step++;
        });

        changeStep();

        if (!nolink) {
            if (!_.isUndefined(urlHash)) {
                apiAnchor.attr('href', apiAnchor.attr('href') + urlHash);
            } else {
                apiAnchor.attr('href', apiAnchor.attr('href') + title);
            }
        }
        
        apiAnchor.text(title);

        document.title = title + ' demos';

        if (aliasList !== '') {
            aliasContainer.show();
            $('#aliasList').text(aliasList);
        }

        if (native.attr('content') === 'true') {
            $('#native-flag').show();
        }

        if (context.attr('content') === 'true') {
            $('#context-flag').show();
        }

        $('#run-button').click(function() {
            clear();
            var scriptBlock = $('script[data-step=' + _commands.currentStep + ']');
            if (scriptBlock.attr('data-listingonly')) {
                logRaw(listingOnlyMessage);
            } else {
                _commands['step' + _commands.currentStep]();
            }
        });

        $('#clear-button').click(function(e) {
            e.preventDefault();
            clear();
            return false;
        });

        $('#steps a').click(function(e) {
            e.preventDefault();
            $(this).tab('show');
        })

        $('#steps a[data-step]').click(function() {
            var step = parseInt(this.getAttribute('data-step'), 10);
            changeStep(step);
            clear();
            elements.html('');
        });

        $('article').fadeIn();
    });
});

// Global functions used on each page
var
    log = function(contents) {
        if (_.isArray(contents)) {
            _.each(contents, function(e, i, l) {
                log(e);
            });
        } else {
            logRaw('<li>' + contents + '</li>');
        }
    },

    logProperty = function(obj, key, list) {
        // This function can be called directly or
        // as an iterator. If it's called as an iterator for an array,
        // then the key name is passed in as the context
        // and is used insted of the 'key' argument
        // which at that time will really be the array index.
        var k = (_.isUndefined(list)) ? key : this.toString();
        log(obj[k]);
    },

    logRaw = function(contents) {
        $('#result').append(contents);
    },

    logObject = function(obj) {
        var
            keys = _.keys(obj),
            i = 0,
            markup = '<p>{<br />';

        _.each(obj, function(value, key, list) {
            markup += ' &nbsp;&nbsp;&nbsp;&nbsp;' + key + ': ' + '&quot;' + value + '&quot;';
            markup += (i === keys.length-1) ? '<br/>' : ', <br />';
            i++
        });

        markup += '}</p>'

        logRaw(markup);
    },

    logBold = function(contents) {
        logRaw('<br /><b>' + contents + '</b>');
    },

    logWarning = function(contents) {
        logRaw('<br /><b class="text-error">' + contents + '</b>');
    },

    logSuccess = function(contents) {
        logRaw('<li><span class="text-success"><b>' + contents + '</b></span></li>');
    },

    logFail = function(contents) {
        logRaw('<li><span class="muted">' + contents + '</span></li>');
    },

    clear = function() {
        $('#result').html('');
        $('#elements').html('');
    },
    
    addElement = function(markup) {
        $('#elements').append(markup);
    },
    
    addButton = function(id, text, classNames) {
        $('#elements').append('<button id="' + id + '" class="btn ' + classNames + '">' + text + '</button>');
    },
    
    logDescriptions = function(values, func) {
        _(values).each(function(value, index, list) {
            var val = value;

            switch (index) {
                case 0: val = 'Infinity'; break;
                case 1: val = 'Negative Infinity'; break;
                case 2: val = 'null'; break;
                case 3: val = 'undefined'; break;
                case 4: val = 'Empty string'; break;
                case 5: val = 'Empty array'; break;
                case 6: val = 'Empty object'; break;
                case 7: val = 'NaN'; break;
                case 8: val = 'Integer'; break;
                case 9: val = 'String'; break;
                case 10: val = 'Boolean (true)'; break;
                case 11: val = 'Boolean (false)'; break;
                case 12: val = 'Date'; break;
                case 13: val = 'Regular expression'; break;
                case 14: val = 'Array'; break;
                case 15: val = 'Object Literal Array'; break;
                case 16: val = 'Object Literal'; break;
                case 17: val = 'DOM Object (direct access)'; break;
                case 18: val = 'DOM Object (via jQuery)'; break;
                case 19: val = 'Arguments'; break;
                case 20: val = 'Empty Arguments'; break;
                case 21: val = 'Function'; break;
                case 22: val = 'Floating Point Number'; break;
                default: break;
            }

            if (func(value)) {
                logSuccess(val);
            } else {
                logFail(val);
            }
        });
    };