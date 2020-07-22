/**
 * Use as helper functions
 */

/**
 * return an object with all fields that passed in `paramKeys`
 * if param is undefined, the param key in returned object will exist, and undefined
 */ 
exports.getObject = (paramKeys = [], srcObj) => {
    const newObject = {};
    paramKeys.forEach(paramKey => {
        newObject[paramKey] = srcObj[paramKey];
    });

    return newObject;
};

/**
 * return an object with all fields that passed in `paramKeys` if the field not undefined
 * 
 * - it uses for updating a document only fields that not undefined
 */ 
exports.getParams = (paramKeys = [], srcObj) => {
    const newObject = {};
    paramKeys.forEach(paramKey => {
        if(srcObj[paramKey] !== undefined) newObject[paramKey] = srcObj[paramKey];
    });

    return newObject;
};


/**
 * 
 * @param options {Object} doc and subDoc data -> {model, documentID,  subDocumentsKey?, subDocumentID?, owner?}
 *                 if `subDocumentsKey` and `subDocumentID` is defined, is subdocMode
 *                  `owner` if defined, it check if owner field the same user username
 * @param callback {fn}  
 * 
 * @return callback(error, document, found, subDocumentIndex)
 * in sendResult mode, `callback` returns promise
 */
exports.accessDocument = ({model, subDocumentsKey, documentID, subDocumentID, owner}, callback, {res, req, modelName}) => {
    const sendResult = res && req && modelName? true : false;
    const subdocMode = subDocumentID && subDocumentsKey? true : false;
    const hasOwner = !!owner; // owener is owner field that compaire with user.username

    const query = {_id: documentID};
    if(subdocMode) {
        query[subDocumentsKey+'._id'] = subDocumentID;
    }

    model.findOne(query)
    .then((doc) => {
        // if doc not defined, doc will be `null`
        // if in query, objectID is not a valid objectID, then .catch() will throws

        if(sendResult) { 
            if(!doc) {
                return res.json({success: false, msg: `${modelName} not found.`});
            }
            if(hasOwner && doc[owner] != req.user.username) {
                return res.json({success: false, msg: `Cannot access to the ${modelName}.`});
            }
        } else
        if(!doc) {
            return callback(null, doc, false, 0);
        }

        let subdocIndex = 0, found = false;

        if(subdocMode)
        for(; i < doc[subDocumentsKey].length; subdocIndex++) {
            if(doc[subDocumentsKey][subdocIndex]._id == subDocumentID) {
                found = true;
                break;               
            }
        }

        if(!sendResult) { 
            return callback(null, doc, found, subdocIndex);
        }
         
        callback(null, doc, found, subdocIndex) // in sendResult mode, it returns promise
        // it reurn model.save()
        .then(doc => {
            res.json({
                success: true,
                msg: `Successful edit the ${modelName}.`
            });
        })
        .catch(error => {
            res.json({success: false, msg: `${modelName} edit error.`, error: error});
        });
    })
    .catch(error => {
        console.log(`${modelName} edit error:`, error);
        if(!sendResult) { 
            return callback(error);
        }
        res.json({success: false, msg: `${modelName} edit error.`, error: error});
    });
};



// if all elements was set, it returns true
exports.isSetAll = (vars) => {
    let isSet = true;
    vars.forEach(variable => {
        if(!variable) isSet = false;
    });

    return isSet;
};


/**
 * 
 * @param {Object} mongoosePaginateResult
 * @return {object} return an pagination object
 */
exports.pagination = ({docs, totalDocs, totalPages, page, limit}) => (
    {
        totalDocs: totalDocs,
        totalPages: totalPages,
        page: page,
        limit: limit
    }
);