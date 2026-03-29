import tensorflow as tf

keras = tf.keras

# Layers
Input = keras.layers.Input
Dense = keras.layers.Dense
GlobalAveragePooling2D = keras.layers.GlobalAveragePooling2D
Concatenate = keras.layers.Concatenate
Multiply = keras.layers.Multiply
Reshape = keras.layers.Reshape

# Models & optimizers
Model = keras.models.Model
Adam = keras.optimizers.Adam

# Pretrained models
ResNet50 = keras.applications.ResNet50
EfficientNetB0 = keras.applications.EfficientNetB0


def se_block(input_tensor, ratio=16):
    filters = input_tensor.shape[-1]

    se = GlobalAveragePooling2D()(input_tensor)
    se = Reshape((1, 1, filters))(se)
    se = Dense(filters // ratio, activation="relu")(se)
    se = Dense(filters, activation="sigmoid")(se)

    return Multiply()([input_tensor, se])


def build_aetl_pxnet(input_shape=(224, 224, 3), num_classes=2):

    input_layer = Input(shape=input_shape)

    resnet = ResNet50(
        weights="imagenet",
        include_top=False,
        input_tensor=input_layer
    )
    resnet.trainable = False
    res_features = se_block(resnet.output)
    res_features = GlobalAveragePooling2D()(res_features)

    effnet = EfficientNetB0(
        weights="imagenet",
        include_top=False,
        input_tensor=input_layer
    )
    effnet.trainable = False
    eff_features = se_block(effnet.output)
    eff_features = GlobalAveragePooling2D()(eff_features)

    merged = Concatenate()([res_features, eff_features])

    x = Dense(256, activation="relu")(merged)
    x = Dense(64, activation="relu")(x)
    output = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs=input_layer, outputs=output)

    model.compile(
        optimizer=Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model


if __name__ == "__main__":
    model = build_aetl_pxnet()
    model.summary()
