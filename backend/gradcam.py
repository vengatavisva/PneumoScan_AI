import tensorflow as tf
import numpy as np
import cv2
import matplotlib.pyplot as plt

# Load trained model
from model import build_aetl_pxnet

model = build_aetl_pxnet()
model.load_weights("aetl_pxnet.weights.h5") 
# Choose last convolutional layer
LAST_CONV_LAYER = "conv5_block3_out"  # ResNet50 last conv layer

def get_gradcam(img_array, model, layer_name):
    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        class_idx = tf.argmax(predictions[0])
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = np.maximum(heatmap, 0)
    heatmap /= np.max(heatmap)

    return heatmap

if __name__ == '__main__':
    # Load and preprocess image
    def load_image(path):
        import cv2
        import numpy as np
        img = cv2.imread(path)
        img = cv2.resize(img, (224, 224))
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_array = np.expand_dims(img_rgb / 255.0, axis=0)
        return img_rgb, img_array

    # Example usage
    img_path = "/Users/vengatavisvasaravanan/data/chest_xray/test/PNEUMONIA/person3_virus_17.jpeg"
    orig_img, img_array = load_image(img_path)

    heatmap = get_gradcam(img_array, model, LAST_CONV_LAYER)

    # Overlay heatmap
    heatmap = cv2.resize(heatmap, (224, 224))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    overlay = cv2.addWeighted(orig_img, 0.6, heatmap, 0.4, 0)

    # Display
    plt.figure(figsize=(8, 4))
    plt.subplot(1, 2, 1)
    plt.title("Original X-ray")
    plt.imshow(orig_img)
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.title("Grad-CAM")
    plt.imshow(overlay)
    plt.axis("off")

    plt.show()
